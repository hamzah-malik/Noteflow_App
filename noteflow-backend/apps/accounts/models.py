import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    email is the actual login field; username stays for @mentions/search and
    because AbstractUser requires it. No role/university fields - NoteFlow
    v1 is intentionally flat per the product brief.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar_path = models.CharField(
        max_length=500, blank=True,
        help_text='Storage path (Supabase), not a public URL - resolved to a signed URL on read.'
    )
    bio = models.TextField(blank=True, max_length=280)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
