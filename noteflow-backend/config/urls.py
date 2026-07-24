from django.contrib import admin
from django.urls import include, path

from apps.accounts.views import MeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/me/', MeView.as_view(), name='me'),
    path('api/', include('apps.notes.urls')),
    path('api/', include('apps.friends.urls')),
    path('api/', include('apps.access_requests.urls')),
    path('api/', include('apps.notifications.urls')),
]
