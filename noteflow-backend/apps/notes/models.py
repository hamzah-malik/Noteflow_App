import uuid

from django.conf import settings
from django.db import models


class Folder(models.Model):
    """
    Real per-user folders (e.g. "University", "Data Structures") - distinct
    from the Categories row on the dashboard, which are computed filters
    (All/Private/Pending/Shared), not stored objects. A note belongs to at
    most one folder; folders themselves don't nest.
    """
    class Icon(models.TextChoices):
        FOLDER = 'folder', 'Folder'
        GRADUATION_CAP = 'graduation-cap', 'University'
        CODE = 'code', 'Code'
        BAR_CHART = 'bar-chart', 'Analysis'
        GLOBE = 'globe', 'Web'

    class Color(models.TextChoices):
        PURPLE = 'purple', 'Purple'
        BLUE = 'blue', 'Blue'
        AMBER = 'amber', 'Amber'
        GREEN = 'green', 'Green'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='folders')
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=20, choices=Icon.choices, default=Icon.FOLDER)
    color = models.CharField(max_length=10, choices=Color.choices, default=Color.BLUE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ('owner', 'name')

    def __str__(self):
        return f'{self.name} ({self.owner_id})'


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Note(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        FRIENDS = 'friends', 'Friends Only'
        PRIVATE = 'private', 'Private'

    class FileType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        DOCX = 'docx', 'DOCX'
        DOC = 'doc', 'DOC'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    tags = models.ManyToManyField(Tag, blank=True, related_name='notes')

    # Storage path within the Supabase bucket - NEVER a public URL. Signed
    # URLs are minted on-demand, only after can_user_access() passes -
    # see apps/access_requests/services.py.
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=10, choices=FileType.choices)
    file_size_bytes = models.PositiveIntegerField()
    thumbnail_path = models.CharField(max_length=500, blank=True)

    visibility = models.CharField(max_length=10, choices=Visibility.choices, default=Visibility.PRIVATE)

    views_count = models.PositiveIntegerField(default=0)
    downloads_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uploader', 'visibility']),
        ]

    def __str__(self):
        return self.title


class RecentView(models.Model):
    """Powers the dashboard's 'Recently Viewed' section. Deliberately a thin
    log, not a counter - we need per-user recency, unlike Note.views_count
    which is a global counter."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recent_views')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='+')
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'note')
        ordering = ['-viewed_at']
