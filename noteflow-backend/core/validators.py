import os

from django.conf import settings
from django.core.exceptions import ValidationError


def validate_note_file(uploaded_file):
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in settings.NOTEFLOW_ALLOWED_UPLOAD_EXTENSIONS:
        allowed = ', '.join(settings.NOTEFLOW_ALLOWED_UPLOAD_EXTENSIONS)
        raise ValidationError(f'Unsupported file type "{ext}". Allowed: {allowed}')

    max_bytes = settings.NOTEFLOW_MAX_FILE_SIZE_MB * 1024 * 1024
    if uploaded_file.size > max_bytes:
        raise ValidationError(f'File too large. Max size is {settings.NOTEFLOW_MAX_FILE_SIZE_MB}MB.')

    return ext.lstrip('.')
