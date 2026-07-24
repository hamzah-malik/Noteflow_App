"""
Storage abstraction over Supabase Storage - the only module that imports the
Supabase SDK. Everything else calls SupabaseStorage, never the SDK directly.
"""

import mimetypes
import os
import uuid

from django.conf import settings
from supabase import Client, create_client


class StorageError(Exception):
    pass


class SupabaseStorage:
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise StorageError(
                'SUPABASE_URL / SUPABASE_SERVICE_KEY are not configured. '
                'Set them in your .env before uploading files.'
            )
        self._client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self._bucket = settings.SUPABASE_STORAGE_BUCKET

    def build_path(self, original_filename: str, prefix: str = 'notes') -> str:
        ext = os.path.splitext(original_filename)[1].lower()
        return f'{prefix}/{uuid.uuid4()}{ext}'

    def upload(self, file_path: str, file_bytes: bytes, content_type: str | None = None) -> str:
        content_type = content_type or mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        self._client.storage.from_(self._bucket).upload(
            path=file_path,
            file=file_bytes,
            file_options={'content-type': content_type, 'upsert': 'false'},
        )
        return file_path

    def get_signed_url(self, file_path: str, expires_in: int | None = None) -> str:
        expires_in = expires_in or settings.SUPABASE_SIGNED_URL_EXPIRY_SECONDS
        result = self._client.storage.from_(self._bucket).create_signed_url(file_path, expires_in)
        return result['signedURL'] if 'signedURL' in result else result.get('signed_url')

    def get_public_url(self, file_path: str) -> str:
        """
        No API call, no signing - just string concatenation. Only correct
        to use when the bucket is actually public (settings.SUPABASE_BUCKET_
        PUBLIC); this method does not check that itself, callers must.
        """
        base = settings.SUPABASE_URL.rstrip('/')
        return f'{base}/storage/v1/object/public/{self._bucket}/{file_path}'

    def delete(self, file_path: str) -> None:
        self._client.storage.from_(self._bucket).remove([file_path])
