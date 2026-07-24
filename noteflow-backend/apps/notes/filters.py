import django_filters

from .models import Note


class NoteFilter(django_filters.FilterSet):
    uploader = django_filters.UUIDFilter(field_name='uploader_id')
    folder = django_filters.UUIDFilter(field_name='folder_id')
    file_type = django_filters.CharFilter(field_name='file_type')
    tag = django_filters.CharFilter(field_name='tags__name', lookup_expr='iexact')
    visibility = django_filters.CharFilter(field_name='visibility')

    class Meta:
        model = Note
        fields = ['uploader', 'folder', 'file_type', 'tag', 'visibility']
