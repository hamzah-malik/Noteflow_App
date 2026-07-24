from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DashboardView, FolderViewSet, NoteViewSet

router = DefaultRouter()
router.register('notes', NoteViewSet, basename='note')
router.register('folders', FolderViewSet, basename='folder')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
] + router.urls
