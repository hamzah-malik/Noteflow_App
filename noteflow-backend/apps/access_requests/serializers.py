from rest_framework import serializers

from apps.accounts.serializers import UserSearchResultSerializer
from .services import can_user_access

from .models import AccessRequest


class AccessRequestSerializer(serializers.ModelSerializer):
    requester_detail = UserSearchResultSerializer(source='requester', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)

    def validate(self, attrs):
        request = self.context.get('request')
        note = attrs.get('note')

        if request and note:
            if note.uploader_id == request.user.id:
                raise serializers.ValidationError({'note': 'You already own this note.'})

            if can_user_access(request.user, note):
                raise serializers.ValidationError({'note': 'You already have access to this note.'})

            if AccessRequest.objects.filter(note=note, requester=request.user).exists():
                raise serializers.ValidationError({'note': 'You already requested access to this note.'})

        return attrs

    class Meta:
        model = AccessRequest
        fields = ['id', 'note', 'note_title', 'requester', 'requester_detail', 'message', 'status', 'created_at', 'decided_at']
        read_only_fields = ['id', 'requester', 'status', 'created_at', 'decided_at']
