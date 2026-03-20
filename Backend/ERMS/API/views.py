from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny          # ← changed from IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Department, Employee, LeaveRecord, Attendance
from .serializers import (
    DepartmentSerializer,
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    LeaveRecordSerializer,
    AttendanceSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.annotate(
        employee_count=Count('employees', filter=Q(employees__status='active'))
    )
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]                      # ← no auth
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related(
        'department', 'manager', 'created_by'
    ).all()
    permission_classes = [AllowAny]                      # ← no auth
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status', 'employment_type', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'employee_id', 'job_title']
    ordering_fields = ['first_name', 'last_name', 'hire_date', 'salary', 'created_at']
    ordering = ['last_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    @action(detail=False, methods=['get'])
    def export_summary(self, request):
        """Returns a summary suitable for export"""
        employees = self.get_queryset()
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)


class LeaveRecordViewSet(viewsets.ModelViewSet):
    """
    In scope for assessment: view & approve/reject leaves.
    Payroll and advanced HR features are out of scope.
    """
    queryset = LeaveRecord.objects.select_related('employee', 'approved_by').all()
    serializer_class = LeaveRecordSerializer
    permission_classes = [AllowAny]                      # ← no auth
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status']
    search_fields = ['employee__first_name', 'employee__last_name']
    ordering_fields = ['start_date', 'created_at']

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {"detail": "Only pending leaves can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )
        leave.status = 'approved'
        leave.save()
        return Response(self.get_serializer(leave).data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.status != 'pending':
            return Response(
                {"detail": "Only pending leaves can be rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )
        leave.status = 'rejected'
        leave.save()
        return Response(self.get_serializer(leave).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]                      # ← no auth
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'status', 'date']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.validated_data['employee']
        date = serializer.validated_data['date']
        if Attendance.objects.filter(employee=employee, date=date).exists():
            return Response(
                {"detail": "Attendance already marked for this employee on this date."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DashboardView(APIView):
    permission_classes = [AllowAny]                      # ← no auth

    def get(self, request):
        now = timezone.now()
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_employees   = Employee.objects.count()
        active_employees  = Employee.objects.filter(status='active').count()
        on_leave          = Employee.objects.filter(status='on_leave').count()
        total_departments = Department.objects.count()
        new_hires         = Employee.objects.filter(hire_date__gte=first_of_month.date()).count()
        pending_leaves    = LeaveRecord.objects.filter(status='pending').count()

        dept_breakdown = list(
            Department.objects.annotate(
                count=Count('employees', filter=Q(employees__status='active'))
            ).values('name', 'count')
        )

        emp_type_counts = {}
        for et in Employee.EMPLOYMENT_TYPE_CHOICES:
            emp_type_counts[et[1]] = Employee.objects.filter(
                employment_type=et[0], status='active'
            ).count()

        return Response({
            'total_employees':        total_employees,
            'active_employees':       active_employees,
            'on_leave':               on_leave,
            'total_departments':      total_departments,
            'new_hires_this_month':   new_hires,
            'pending_leaves':         pending_leaves,
            'department_breakdown':   dept_breakdown,
            'employment_type_breakdown': emp_type_counts,
        })
