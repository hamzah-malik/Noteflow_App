from rest_framework import serializers

from apps.accounts.serializers import UserSearchResultSerializer

from .models import AccessRequest


class AccessRequestSerializer(serializers.ModelSerializer):
    requester_detail = UserSearchResultSerializer(source='requester', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)

    class Meta:
        model = AccessRequest
        fields = ['id', 'note', 'note_title', 'requester', 'requester_detail', 'message', 'status', 'created_at', 'decided_at']
        read_only_fields = ['id', 'requester', 'status', 'created_at', 'decided_at']
