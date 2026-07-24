from rest_framework import serializers

from core.validators import validate_note_file

from .models import Folder, Note, Tag


class FolderSerializer(serializers.ModelSerializer):
    notes_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'icon', 'color', 'notes_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_notes_count(self, obj):
        # Annotated in the viewset's queryset when possible; this fallback
        # keeps the serializer correct even if used outside that queryset.
        return getattr(obj, 'notes_count', None) if hasattr(obj, 'notes_count') else obj.notes.count()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class NoteListSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source='uploader.full_name', read_only=True)
    uploader_username = serializers.CharField(source='uploader.username', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    can_access = serializers.SerializerMethodField()
    has_pending_request = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'uploader', 'uploader_name', 'uploader_username',
            'folder', 'folder_name', 'tags', 'file_type', 'thumbnail_path', 'visibility',
            'views_count', 'downloads_count', 'created_at', 'can_access', 'has_pending_request',
        ]

    def get_can_access(self, obj):
        # Lets the frontend decide Download vs "Request Access" without a
        # second round trip - see access_requests.services.can_user_access.
        from apps.access_requests.services import can_user_access
        request = self.context.get('request')
        if not request:
            return False
        return can_user_access(request.user, obj)

    def get_has_pending_request(self, obj):
        # Distinguishes "locked, no request yet" from "locked, awaiting
        # owner's decision" - the NoteCard's locked vs pending badge.
        from apps.access_requests.models import AccessRequest
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return AccessRequest.objects.filter(
            note=obj, requester=request.user, status=AccessRequest.Status.PENDING
        ).exists()


class NoteDetailSerializer(NoteListSerializer):
    class Meta(NoteListSerializer.Meta):
        fields = NoteListSerializer.Meta.fields + ['updated_at']


class NoteUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    tag_names = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    folder = serializers.PrimaryKeyRelatedField(queryset=Folder.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'description', 'visibility', 'folder', 'file', 'tag_names']

    def validate_folder(self, folder):
        request = self.context.get('request')
        if folder and request and folder.owner_id != request.user.id:
            raise serializers.ValidationError("You can only file notes into your own folders.")
        return folder

    def validate_file(self, uploaded_file):
        validate_note_file(uploaded_file)
        return uploaded_file
