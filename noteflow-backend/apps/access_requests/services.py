"""
Single source of truth for "can this user access this note's file". Every
place that touches a note's actual file (download, preview) MUST call
can_user_access() first - note metadata (title, tags) is a separate concern,
visible regardless, so a Private note can still show up in search with a
"Request Access" button instead of Download.
"""

from apps.notes.models import Note

from .models import AccessRequest


def can_user_access(user, note: Note) -> bool:
    if not user.is_authenticated:
        return note.visibility == Note.Visibility.PUBLIC

    if note.uploader_id == user.id:
        return True

    if note.visibility == Note.Visibility.PUBLIC:
        return True

    # FRIENDS and PRIVATE both require an approved request to actually
    # access the file - being a friend only grants discoverability
    # (see can_user_discover), not automatic download rights.
    return AccessRequest.objects.filter(
        note=note, requester=user, status=AccessRequest.Status.APPROVED
    ).exists()


def can_user_discover(user, note: Note) -> bool:
    """
    Whether a note should even appear in listings for this user - distinct
    from can_user_access, which gates the actual file. A PRIVATE note is
    invisible to everyone but its owner, even friends; a FRIENDS note is
    visible (as locked, pending Request Access) to accepted friends only;
    PUBLIC is visible to everyone.
    """
    if not user.is_authenticated:
        return note.visibility == Note.Visibility.PUBLIC

    if note.uploader_id == user.id:
        return True

    if note.visibility == Note.Visibility.PUBLIC:
        return True

    if note.visibility == Note.Visibility.FRIENDS:
        from apps.friends.services import are_friends
        return are_friends(user, note.uploader)

    return False
