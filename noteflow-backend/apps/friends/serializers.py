from rest_framework import serializers

from apps.accounts.serializers import UserSearchResultSerializer

from .models import FriendRequest


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user_detail = UserSearchResultSerializer(source='from_user', read_only=True)
    to_user_detail = UserSearchResultSerializer(source='to_user', read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'from_user_detail', 'to_user', 'to_user_detail', 'status', 'created_at', 'responded_at']
        read_only_fields = ['id', 'from_user', 'status', 'created_at', 'responded_at']
