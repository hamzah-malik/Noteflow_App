from django.contrib import admin

from .models import Folder, Note, RecentView, Tag


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'icon', 'color', 'created_at')
    list_filter = ('icon', 'color')
    search_fields = ('name',)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploader', 'visibility', 'views_count', 'downloads_count', 'created_at')
    list_filter = ('visibility', 'file_type')
    search_fields = ('title', 'description')


admin.site.register(Tag)
admin.site.register(RecentView)
