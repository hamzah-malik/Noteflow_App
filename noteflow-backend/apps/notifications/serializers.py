from rest_framework import serializers

from apps.accounts.serializers import UserSearchResultSerializer

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_detail = UserSearchResultSerializer(source='actor', read_only=True)
    # Generic target resolved to a minimal dict rather than a nested
    # polymorphic serializer - the frontend only ever needs an id + label
    # to link to (a note or an access request), not the full object.
    target_label = serializers.SerializerMethodField()
    target_status = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'actor_detail', 'verb', 'target_id', 'target_label', 'target_status', 'is_read', 'created_at']

    def get_target_label(self, obj):
        target = obj.target
        if target is None:
            return None
        # AccessRequest targets surface the note's title.
        note = getattr(target, 'note', None)
        if note is not None:
            return note.title
        # FriendRequest targets have no natural single label ("X -> Y" isn't
        # meaningful to a reader) - the verb text alone ("accepted your
        # friend request") already says everything needed, so omit it.
        if hasattr(target, 'from_user_id') and hasattr(target, 'to_user_id'):
            return None
        return getattr(target, 'title', None) or None

    def get_target_status(self, obj):
        # Notifications are historical log entries - "Anas2 requested
        # access" stays true forever, even after approval. Without this,
        # the frontend has no way to know the request was already resolved
        # and would show Approve/Reject on a stale event indefinitely.
        target = obj.target
        return getattr(target, 'status', None) if target is not None else None
