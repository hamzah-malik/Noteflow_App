from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'full_name', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'full_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('NoteFlow profile', {'fields': ('full_name', 'avatar_path', 'bio')}),
    )
