from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Employee, LeaveRecord, PerformanceReview, Attendance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'employee_count', 'created_at']

    def get_employee_count(self, obj):
        return obj.employees.filter(status='active').count()
    
    def get_employee_count(self, obj):
        return getattr(obj, 'employee_count', obj.employees.filter(status='active').count())


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing employees"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'first_name', 'last_name',
            'email', 'phone', 'job_title', 'department', 'department_name',
            'status', 'employment_type', 'hire_date', 'photo', 'status_display',
            'employment_type_display',
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Full serializer for employee detail/create/update"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
    
    def validate(self, data):
        email = data.get('email')
        employee_id = data.get('employee_id')

        instance = getattr(self, 'instance', None)

        # Email validation
        if email:
            qs = Employee.objects.filter(email=email)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"email": "Email already exists."})

        # Employee ID validation
        if employee_id:
            qs = Employee.objects.filter(employee_id=employee_id)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"employee_id": "Employee ID already exists."})

        return data


class LeaveRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    duration_days = serializers.ReadOnlyField()

    class Meta:
        model = LeaveRecord
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date must be after start date.")
        return data


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'
        read_only_fields = ['created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            validated_data['reviewer'] = request.user
        return super().create(validated_data)


class DashboardStatsSerializer(serializers.Serializer):
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    on_leave = serializers.IntegerField()
    total_departments = serializers.IntegerField()
    new_hires_this_month = serializers.IntegerField()
    pending_leaves = serializers.IntegerField()
    department_breakdown = serializers.ListField()
    employment_type_breakdown = serializers.DictField()


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')

        if Attendance.objects.filter(employee=employee, date=date).exists():
            raise serializers.ValidationError({
                "detail": "Attendance already marked for this employee on this date."
            })

        return data