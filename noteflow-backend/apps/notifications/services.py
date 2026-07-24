from .models import Notification


def notify(recipient, actor, verb, target=None):
    """Single entry point for creating a notification - callers in other
    apps (access_requests, friends) should never construct Notification
    objects directly, so this stays the one place notification-creation
    logic (e.g. muting, digesting later) can live."""
    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        target=target,
    )
