from django.db.models import Q

from .models import FriendRequest


def are_friends(user_a, user_b) -> bool:
    return FriendRequest.objects.filter(
        Q(from_user=user_a, to_user=user_b) | Q(from_user=user_b, to_user=user_a),
        status=FriendRequest.Status.ACCEPTED,
    ).exists()


def friend_ids(user) -> list:
    """All user IDs this user is friends with, either direction."""
    sent = FriendRequest.objects.filter(from_user=user, status=FriendRequest.Status.ACCEPTED).values_list('to_user_id', flat=True)
    received = FriendRequest.objects.filter(to_user=user, status=FriendRequest.Status.ACCEPTED).values_list('from_user_id', flat=True)
    return list(sent) + list(received)
