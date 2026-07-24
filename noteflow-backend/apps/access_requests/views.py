from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.services import notify

from .models import AccessRequest
from .serializers import AccessRequestSerializer


class AccessRequestViewSet(viewsets.ModelViewSet):
    """
    This is the product's core feature (see NoteFlow brief). create() is the
    "Request Access" dialog submit; approve/reject are the owner's buttons
    on the notification. Both trigger a Notification - see notifications app.
    """
    serializer_class = AccessRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        direction = self.request.query_params.get('direction')
        if direction == 'sent':
            return AccessRequest.objects.filter(requester=user)
        if direction == 'received':
            # Requests on notes I own - what the "Pending Requests" dashboard
            # section and the approval notification list are built from.
            return AccessRequest.objects.filter(note__uploader=user)
        return AccessRequest.objects.filter(Q(requester=user) | Q(note__uploader=user))

    def perform_create(self, serializer):
        access_request = serializer.save(requester=self.request.user)
        notify(recipient=access_request.note.uploader, actor=self.request.user,
               verb=Notification.Verb.ACCESS_REQUESTED, target=access_request)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ar = self.get_object()
        if ar.note.uploader_id != request.user.id:
            return Response({'detail': 'Only the note owner can approve access.'}, status=status.HTTP_403_FORBIDDEN)
        ar.status = AccessRequest.Status.APPROVED
        ar.decided_at = timezone.now()
        ar.save(update_fields=['status', 'decided_at'])
        notify(recipient=ar.requester, actor=request.user, verb=Notification.Verb.ACCESS_APPROVED, target=ar)
        return Response(AccessRequestSerializer(ar).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ar = self.get_object()
        if ar.note.uploader_id != request.user.id:
            return Response({'detail': 'Only the note owner can reject access.'}, status=status.HTTP_403_FORBIDDEN)
        ar.status = AccessRequest.Status.REJECTED
        ar.decided_at = timezone.now()
        ar.save(update_fields=['status', 'decided_at'])
        notify(recipient=ar.requester, actor=request.user, verb=Notification.Verb.ACCESS_REJECTED, target=ar)
        return Response(AccessRequestSerializer(ar).data)
