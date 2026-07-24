import uuid

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Notification(models.Model):
    """
    Generic (actor, verb, target) shape rather than one model per
    notification type - 'Ali requested access to X' and 'Sara accepted your
    friend request' both fit this without new tables each time a new
    notification-worthy event is added later.
    """
    class Verb(models.TextChoices):
        FRIEND_REQUEST = 'friend_request', 'sent you a friend request'
        FRIEND_ACCEPTED = 'friend_accepted', 'accepted your friend request'
        ACCESS_REQUESTED = 'access_requested', 'requested access to'
        ACCESS_APPROVED = 'access_approved', 'approved your access request for'
        ACCESS_REJECTED = 'access_rejected', 'declined your access request for'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='+', null=True)
    verb = models.CharField(max_length=30, choices=Verb.choices)

    target_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    target_id = models.UUIDField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_id')

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['recipient', 'is_read'])]

    def __str__(self):
        return f'{self.actor_id} {self.verb} -> {self.recipient_id}'
