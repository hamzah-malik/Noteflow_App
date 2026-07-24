import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import F, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.access_requests.models import AccessRequest
from apps.access_requests.serializers import AccessRequestSerializer
from apps.access_requests.services import can_user_access
from apps.friends.services import are_friends, friend_ids
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer

from .filters import NoteFilter
from .models import Folder, Note, RecentView, Tag
from .serializers import FolderSerializer, NoteDetailSerializer, NoteListSerializer, NoteUploadSerializer
from .storage import StorageError, SupabaseStorage

User = get_user_model()


class FolderViewSet(viewsets.ModelViewSet):
    """Personal folders - see Note.folder. Own folders are fully manageable;
    a friend's folders can be listed (read-only) for the Friend Profile
    browsing flow, gated by an actual friendship check, never open to
    strangers."""
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get('user')
        if user_id and user_id != str(self.request.user.id):
            target = get_object_or_404(User, id=user_id)
            if not are_friends(self.request.user, target):
                return Folder.objects.none()
            # Only count notes this viewer can actually discover (public or
            # friends-visible) - a friend's private notes must never
            # inflate a folder's visible count.
            visible_notes = Q(notes__visibility=Note.Visibility.PUBLIC) | \
                Q(notes__visibility=Note.Visibility.FRIENDS)
            return Folder.objects.filter(owner=target).annotate(
                notes_count=Count('notes', filter=visible_notes, distinct=True)
            )
        return Folder.objects.filter(owner=self.request.user).annotate(notes_count=Count('notes'))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        # Write actions only make sense on your own folders - get_queryset
        # already returns other users' folders read-only in practice since
        # DRF's update/destroy still require the object to be in the
        # queryset, but block writes explicitly for clarity and safety.
        if self.action in ('update', 'partial_update', 'destroy', 'share'):
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS and obj.owner_id != request.user.id:
            self.permission_denied(request, message='You can only modify your own folders.')

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Bulk-set visibility for every note in this folder at once - the
        "share this whole folder" feature, rather than requiring someone to
        edit each note's visibility individually.
        """
        folder = self.get_object()
        if folder.owner_id != request.user.id:
            return Response({'detail': 'You can only share your own folders.'}, status=status.HTTP_403_FORBIDDEN)

        visibility = request.data.get('visibility')
        valid_values = [c[0] for c in Note.Visibility.choices]
        if visibility not in valid_values:
            return Response({'detail': f'visibility must be one of {valid_values}'}, status=status.HTTP_400_BAD_REQUEST)

        updated = folder.notes.update(visibility=visibility)
        return Response({'detail': f'{updated} note(s) updated.', 'visibility': visibility})


class IsUploaderOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.uploader_id == request.user.id


class NoteViewSet(viewsets.ModelViewSet):
    """
    Listing/search returns metadata only for notes this user can discover -
    own notes, public notes, and FRIENDS-visibility notes from accepted
    friends. PRIVATE notes are invisible to everyone but their owner, even
    friends. This queryset is the actual enforcement point; can_user_access
    (file download/preview) is a separate, stricter check on top of it.
    """
    permission_classes = [permissions.IsAuthenticated, IsUploaderOrReadOnly]
    filterset_class = NoteFilter
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'views_count', 'downloads_count', 'title']

    def get_queryset(self):
        user = self.request.user
        friends = friend_ids(user)
        discoverable = Q(uploader=user) | Q(visibility=Note.Visibility.PUBLIC) | \
            Q(visibility=Note.Visibility.FRIENDS, uploader_id__in=friends)
        return Note.objects.filter(discoverable).select_related('uploader', 'folder').prefetch_related('tags').distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return NoteUploadSerializer
        if self.action == 'retrieve':
            return NoteDetailSerializer
        return NoteListSerializer

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def perform_create(self, serializer):
        uploaded_file = serializer.validated_data.pop('file')
        tag_names = serializer.validated_data.pop('tag_names', [])
        ext = os.path.splitext(uploaded_file.name)[1].lstrip('.').lower()

        try:
            storage = SupabaseStorage()
            file_path = storage.build_path(uploaded_file.name)
            storage.upload(file_path, uploaded_file.read(), content_type=uploaded_file.content_type)
        except StorageError as exc:
            raise serializers.ValidationError({'file': str(exc)})

        note = serializer.save(
            uploader=self.request.user,
            file_path=file_path,
            file_type=ext,
            file_size_bytes=uploaded_file.size,
        )
        if tag_names:
            tags = [Tag.objects.get_or_create(name=name.strip().lower())[0] for name in tag_names if name.strip()]
            note.tags.set(tags)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        note = self.get_object()
        if not can_user_access(request.user, note):
            return Response({'detail': 'This note is private. Request access from the owner.'}, status=status.HTTP_403_FORBIDDEN)

        Note.objects.filter(pk=note.pk).update(downloads_count=F('downloads_count') + 1)
        try:
            storage = SupabaseStorage()
            url = storage.get_public_url(note.file_path) if settings.SUPABASE_BUCKET_PUBLIC else storage.get_signed_url(note.file_path)
        except StorageError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'url': url})

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        note = self.get_object()
        if not can_user_access(request.user, note):
            return Response({'detail': 'This note is private. Request access from the owner.'}, status=status.HTTP_403_FORBIDDEN)

        Note.objects.filter(pk=note.pk).update(views_count=F('views_count') + 1)
        RecentView.objects.update_or_create(user=request.user, note=note)
        try:
            storage = SupabaseStorage()
            url = storage.get_public_url(note.file_path) if settings.SUPABASE_BUCKET_PUBLIC else storage.get_signed_url(note.file_path)
        except StorageError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'url': url})



class DashboardView(APIView):
    """
    Aggregated dashboard data - one round trip for everything the NoteFlow
    brief's Home Dashboard section asks for. Kept as a single endpoint on
    the notes app rather than a new 'dashboard' app since notes.Note is the
    central entity everything else here hangs off of.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        my_recent = Note.objects.filter(uploader=user).order_by('-created_at')[:6]

        friends = friend_ids(user)
        friend_uploads = Note.objects.filter(uploader_id__in=friends).order_by('-created_at')[:6]

        # "Shared with me" - notes I don't own but can access: approved
        # private requests plus anything public/university-visible from
        # friends. This is what the mockup's "Shared Notes" category and
        # nav item both point at.
        approved_note_ids = AccessRequest.objects.filter(
            requester=user, status=AccessRequest.Status.APPROVED
        ).values_list('note_id', flat=True)
        shared_with_me = Note.objects.exclude(uploader=user).filter(
            Q(id__in=approved_note_ids) | Q(visibility=Note.Visibility.PUBLIC, uploader_id__in=friends)
        ).distinct().order_by('-created_at')

        recently_viewed_ids = list(
            RecentView.objects.filter(user=user).order_by('-viewed_at').values_list('note_id', flat=True)[:6]
        )
        recently_viewed = Note.objects.filter(id__in=recently_viewed_ids)
        recently_viewed = sorted(recently_viewed, key=lambda n: recently_viewed_ids.index(n.id))

        pending_requests = AccessRequest.objects.filter(
            note__uploader=user, status=AccessRequest.Status.PENDING
        ).select_related('requester', 'note').order_by('-created_at')[:10]

        notifications = Notification.objects.filter(recipient=user).select_related('actor').order_by('-created_at')[:10]
        unread_count = Notification.objects.filter(recipient=user, is_read=False).count()

        folders = Folder.objects.filter(owner=user).annotate(notes_count=Count('notes')).order_by('name')

        ctx = {'request': request}
        my_notes_qs = Note.objects.filter(uploader=user)
        return Response({
            'stats': {
                'total_uploads': my_notes_qs.count(),
                'friend_count': len(friends),
                'pending_requests_count': pending_requests.count(),
                'unread_notifications_count': unread_count,
                # Categories row on the dashboard - computed filters, not
                # stored objects (unlike Folder, which is a real model).
                'all_notes_count': my_notes_qs.count() + shared_with_me.count(),
                'private_notes_count': my_notes_qs.filter(visibility=Note.Visibility.PRIVATE).count(),
                'public_count': my_notes_qs.filter(visibility=Note.Visibility.PUBLIC).count(),
                'friends_only_count': my_notes_qs.filter(visibility=Note.Visibility.FRIENDS).count(),
                'pending_access_count': pending_requests.count(),
                'shared_notes_count': shared_with_me.count(),
            },
            'folders': FolderSerializer(folders, many=True).data,
            'my_recent_uploads': NoteListSerializer(my_recent, many=True, context=ctx).data,
            'friend_uploads': NoteListSerializer(friend_uploads, many=True, context=ctx).data,
            'shared_with_me': NoteListSerializer(shared_with_me[:6], many=True, context=ctx).data,
            'recently_viewed': NoteListSerializer(recently_viewed, many=True, context=ctx).data,
            'pending_requests': AccessRequestSerializer(pending_requests, many=True).data,
            'notifications': NotificationSerializer(notifications, many=True).data,
        })
