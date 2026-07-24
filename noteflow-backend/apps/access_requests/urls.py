from rest_framework.routers import DefaultRouter

from .views import AccessRequestViewSet

router = DefaultRouter()
router.register('access-requests', AccessRequestViewSet, basename='access-request')

urlpatterns = router.urls
