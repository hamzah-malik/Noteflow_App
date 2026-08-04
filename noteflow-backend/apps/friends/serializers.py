from rest_framework import serializers

from apps.accounts.serializers import UserSearchResultSerializer

from .models import FriendRequest
from .services import are_friends


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user_detail = UserSearchResultSerializer(source='from_user', read_only=True)
    to_user_detail = UserSearchResultSerializer(source='to_user', read_only=True)

    def validate(self, attrs):
        request = self.context.get('request')
        to_user = attrs.get('to_user')

        if request and to_user:
            if request.user.id == to_user.id:
                raise serializers.ValidationError({'to_user': 'You cannot send a friend request to yourself.'})

            if are_friends(request.user, to_user):
                raise serializers.ValidationError({'to_user': 'You are already friends.'})

            existing_active = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=to_user,
                status__in=[FriendRequest.Status.PENDING, FriendRequest.Status.ACCEPTED],
            ).exists() or FriendRequest.objects.filter(
                from_user=to_user,
                to_user=request.user,
                status__in=[FriendRequest.Status.PENDING, FriendRequest.Status.ACCEPTED],
            ).exists()

            if existing_active:
                raise serializers.ValidationError({'to_user': 'A friend request is already pending or accepted between you two.'})

        return attrs

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'from_user_detail', 'to_user', 'to_user_detail', 'status', 'created_at', 'responded_at']
        read_only_fields = ['id', 'from_user', 'status', 'created_at', 'responded_at']
