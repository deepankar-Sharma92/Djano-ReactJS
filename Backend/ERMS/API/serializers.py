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
        return getattr(obj, 'employee_count', obj.employees.filter(status='active').count())


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'first_name', 'last_name',
            'email', 'phone', 'job_title', 'department', 'department_name',
            'status', 'employment_type', 'hire_date', 'photo',
            'status_display', 'employment_type_display',
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name       = serializers.ReadOnlyField()
    manager_name    = serializers.CharField(source='manager.full_name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')

    class Meta:
        model  = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']  # ← created_by read_only
        extra_kwargs = {
            'manager':          {'required': False, 'allow_null': True},
            'phone':            {'required': False, 'allow_blank': True, 'default': ''},
            'address':          {'required': False, 'allow_blank': True, 'default': ''},
            'job_title':        {'required': False, 'allow_blank': True, 'default': ''},
            'salary':           {'required': False, 'default': 0},
            'gender':           {'required': False, 'default': 'M'},
            'photo':            {'required': False, 'allow_null': True},
            'employment_type':  {'required': False, 'default': 'full_time'},
            'status':           {'required': False, 'default': 'active'},
            'hire_date':        {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        # ✅ No auth — created_by ko None set karo
        validated_data.pop('created_by', None)
        return super().create(validated_data)

    def validate(self, data):
        email       = data.get('email')
        employee_id = data.get('employee_id')
        instance    = getattr(self, 'instance', None)

        if email:
            qs = Employee.objects.filter(email=email)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"email": "Email already exists."})

        if employee_id:
            qs = Employee.objects.filter(employee_id=employee_id)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"employee_id": "Employee ID already exists."})

        return data


class LeaveRecordSerializer(serializers.ModelSerializer):
    employee_name    = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default='')
    duration_days    = serializers.ReadOnlyField()

    class Meta:
        model  = LeaveRecord
        fields = '__all__'
        read_only_fields = ['created_at']
        extra_kwargs = {
            'approved_by': {'required': False, 'allow_null': True},
        }

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError("End date must be after start date.")
        return data


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True, default='')
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)

    class Meta:
        model  = PerformanceReview
        fields = '__all__'
        read_only_fields = ['created_at']
        extra_kwargs = {
            'reviewer': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        validated_data.pop('reviewer', None)
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model  = Attendance
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        employee = data.get('employee')
        date     = data.get('date')
        instance = getattr(self, 'instance', None)

        if not instance:  # only on create
            if Attendance.objects.filter(employee=employee, date=date).exists():
                raise serializers.ValidationError({
                    "detail": "Attendance already marked for this employee on this date."
                })
        return data


class DashboardStatsSerializer(serializers.Serializer):
    total_employees          = serializers.IntegerField()
    active_employees         = serializers.IntegerField()
    on_leave                 = serializers.IntegerField()
    total_departments        = serializers.IntegerField()
    new_hires_this_month     = serializers.IntegerField()
    pending_leaves           = serializers.IntegerField()
    department_breakdown     = serializers.ListField()
    employment_type_breakdown = serializers.DictField()
