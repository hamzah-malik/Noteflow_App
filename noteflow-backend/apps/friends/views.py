from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import UserSearchResultSerializer
from apps.notes.models import Note
from apps.notifications.models import Notification
from apps.notifications.services import notify

from .models import FriendRequest
from .serializers import FriendRequestSerializer
from .services import are_friends, friend_ids

User = get_user_model()


class UserSearchView(generics.ListAPIView):
    """Search Students - simple substring match on username/full_name."""
    serializer_class = UserSearchResultSerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            return User.objects.none()
        return User.objects.filter(
            Q(username__icontains=q) | Q(full_name__icontains=q)
        ).exclude(id=self.request.user.id)[:20]


class FriendRequestViewSet(viewsets.ModelViewSet):
    """
    list/create handle sending requests; approve/reject/remove are custom
    actions rather than PATCH, because each has distinct side effects
    (notifications) that a generic partial-update would obscure.
    """
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        direction = self.request.query_params.get('direction')
        if direction == 'sent':
            return FriendRequest.objects.filter(from_user=user)
        if direction == 'received':
            return FriendRequest.objects.filter(to_user=user)
        return FriendRequest.objects.filter(Q(from_user=user) | Q(to_user=user))

    def perform_create(self, serializer):
        request_obj = serializer.save(from_user=self.request.user)
        notify(recipient=request_obj.to_user, actor=self.request.user,
               verb=Notification.Verb.FRIEND_REQUEST, target=request_obj)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        fr = self.get_object()
        if fr.to_user_id != request.user.id:
            return Response({'detail': 'Not your request to accept.'}, status=status.HTTP_403_FORBIDDEN)
        fr.status = FriendRequest.Status.ACCEPTED
        fr.responded_at = timezone.now()
        fr.save(update_fields=['status', 'responded_at'])
        notify(recipient=fr.from_user, actor=request.user, verb=Notification.Verb.FRIEND_ACCEPTED, target=fr)
        return Response(FriendRequestSerializer(fr).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        fr = self.get_object()
        if fr.to_user_id != request.user.id:
            return Response({'detail': 'Not your request to reject.'}, status=status.HTTP_403_FORBIDDEN)
        fr.status = FriendRequest.Status.REJECTED
        fr.responded_at = timezone.now()
        fr.save(update_fields=['status', 'responded_at'])
        return Response(FriendRequestSerializer(fr).data)

    def destroy(self, request, *args, **kwargs):
        """Removing a friend = deleting the accepted request between you two."""
        fr = self.get_object()
        if request.user.id not in (fr.from_user_id, fr.to_user_id):
            return Response({'detail': 'Not your friendship to remove.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class FriendListView(generics.ListAPIView):
    """Accepted friends only, as user objects (not request objects) - the
    natural shape the Friends page wants."""
    serializer_class = UserSearchResultSerializer

    def get_queryset(self):
        return User.objects.filter(id__in=friend_ids(self.request.user))


class FriendNotesSummaryView(APIView):
    """
    Powers the Friends' Notes page cards - each friend with how many
    folders and notes they have that are actually discoverable to the
    requester (public + friends-visible; their private notes never count).
    """
    def get(self, request):
        ids = friend_ids(request.user)
        visible = Q(notes__visibility=Note.Visibility.PUBLIC) | Q(notes__visibility=Note.Visibility.FRIENDS)
        friends = User.objects.filter(id__in=ids).annotate(
            folder_count=Count('folders', distinct=True),
            note_count=Count('notes', filter=visible, distinct=True),
        )
        return Response([
            {
                'id': f.id,
                'username': f.username,
                'full_name': f.full_name,
                'avatar_path': f.avatar_path,
                'bio': f.bio,
                'folder_count': f.folder_count,
                'note_count': f.note_count,
            }
            for f in friends
        ])


class FriendProfileView(APIView):
    """
    The gated entry point for the whole discovery flow: Friend -> Profile ->
    Folder -> Note -> Request Access. A non-friend gets a deliberately
    minimal response - no counts, no folder names, nothing that reveals
    what this person has uploaded - only enough to show an Add Friend
    button, per the "non friends see nothing" requirement.
    """
    def get(self, request, user_id):
        target = get_object_or_404(User, id=user_id)
        is_friend = are_friends(request.user, target) or target.id == request.user.id

        if not is_friend:
            return Response({
                'is_friend': False,
                'user': {
                    'id': target.id,
                    'username': target.username,
                    'full_name': target.full_name,
                    'avatar_path': target.avatar_path,
                },
            })

        visible = Q(notes__visibility=Note.Visibility.PUBLIC) | Q(notes__visibility=Note.Visibility.FRIENDS)
        note_count = Note.objects.filter(
            uploader=target
        ).filter(Q(visibility=Note.Visibility.PUBLIC) | Q(visibility=Note.Visibility.FRIENDS)).count()

        return Response({
            'is_friend': True,
            'user': {
                'id': target.id,
                'username': target.username,
                'full_name': target.full_name,
                'avatar_path': target.avatar_path,
                'bio': target.bio,
            },
            'folder_count': target.folders.count(),
            'note_count': note_count,
        })
