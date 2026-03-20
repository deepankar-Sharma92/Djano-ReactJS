from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DashboardView, DepartmentViewSet, LeaveRecordViewSet, AttendanceViewSet

# ✅ Create router
router = DefaultRouter()
router.register('employees', EmployeeViewSet)
# AB — sabhi register hain:
router.register('departments', DepartmentViewSet)
router.register('leaves',      LeaveRecordViewSet)
router.register('attendance',  AttendanceViewSet)

# ✅ URL patterns
urlpatterns = [
    path('', include(router.urls)),  # for employees API
    path('dashboard/', DashboardView.as_view()),  # for dashboard API
]