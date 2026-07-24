from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import FriendListView, FriendNotesSummaryView, FriendProfileView, FriendRequestViewSet, UserSearchView

router = DefaultRouter()
router.register('friend-requests', FriendRequestViewSet, basename='friend-request')

urlpatterns = [
    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/notes-summary/', FriendNotesSummaryView.as_view(), name='friend-notes-summary'),
    path('friends/<uuid:user_id>/profile/', FriendProfileView.as_view(), name='friend-profile'),
] + router.urls
