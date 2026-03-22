# Backend/ERMS/API/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from API.models import Department, Employee, LeaveRecord, Attendance
from datetime import date


class Command(BaseCommand):
    help = 'Seed sample data — safe to run multiple times (uses get_or_create)'

    def handle(self, *args, **kwargs):

        # ── Departments — get_or_create so no duplicates ──
        eng, _ = Department.objects.get_or_create(name='Engineering',  defaults={'description': 'Software & Tech team'})
        hr,  _ = Department.objects.get_or_create(name='HR',           defaults={'description': 'Human Resources'})
        fin, _ = Department.objects.get_or_create(name='Finance',      defaults={'description': 'Finance & Accounts'})
        mkt, _ = Department.objects.get_or_create(name='Marketing',    defaults={'description': 'Marketing & Growth'})
        ops, _ = Department.objects.get_or_create(name='Operations',   defaults={'description': 'Operations & Logistics'})
        self.stdout.write('✅ Departments ready')

        # ── Employees — get_or_create by employee_id ──
        e1, _ = Employee.objects.get_or_create(employee_id='EMP001', defaults={'first_name': 'Aditi',  'last_name': 'Nair',   'email': 'aditi@erms.com',  'department': eng, 'job_title': 'Sr. Developer',   'employment_type': 'full_time', 'status': 'active',   'hire_date': date(2024, 3, 10), 'salary': 90000, 'gender': 'F'})
        e2, _ = Employee.objects.get_or_create(employee_id='EMP002', defaults={'first_name': 'Vikram', 'last_name': 'Singh',  'email': 'vikram@erms.com', 'department': fin, 'job_title': 'Finance Analyst', 'employment_type': 'full_time', 'status': 'on_leave', 'hire_date': date(2024, 1, 5),  'salary': 70000, 'gender': 'M'})
        e3, _ = Employee.objects.get_or_create(employee_id='EMP003', defaults={'first_name': 'Priya',  'last_name': 'Mehta',  'email': 'priya@erms.com',  'department': mkt, 'job_title': 'Team Lead',      'employment_type': 'part_time', 'status': 'active',   'hire_date': date(2025, 6, 15), 'salary': 65000, 'gender': 'F'})
        e4, _ = Employee.objects.get_or_create(employee_id='EMP004', defaults={'first_name': 'Rohan',  'last_name': 'Joshi',  'email': 'rohan@erms.com',  'department': ops, 'job_title': 'Ops Manager',    'employment_type': 'contract',  'status': 'active',   'hire_date': date(2026, 2, 20), 'salary': 80000, 'gender': 'M'})
        e5, _ = Employee.objects.get_or_create(employee_id='EMP005', defaults={'first_name': 'Sonia',  'last_name': 'Kapoor', 'email': 'sonia@erms.com',  'department': hr,  'job_title': 'HR Executive',   'employment_type': 'full_time', 'status': 'active',   'hire_date': date(2026, 3, 1),  'salary': 60000, 'gender': 'F'})
        e6, _ = Employee.objects.get_or_create(employee_id='EMP006', defaults={'first_name': 'Arjun',  'last_name': 'Sharma', 'email': 'arjun@erms.com',  'department': eng, 'job_title': 'Backend Dev',    'employment_type': 'full_time', 'status': 'active',   'hire_date': date(2025, 9, 10), 'salary': 85000, 'gender': 'M'})
        e7, _ = Employee.objects.get_or_create(employee_id='EMP007', defaults={'first_name': 'Neha',   'last_name': 'Gupta',  'email': 'neha@erms.com',   'department': eng, 'job_title': 'Frontend Dev',   'employment_type': 'intern',    'status': 'active',   'hire_date': date(2026, 3, 15), 'salary': 30000, 'gender': 'F'})
        e8, _ = Employee.objects.get_or_create(employee_id='EMP008', defaults={'first_name': 'Rahul',  'last_name': 'Verma',  'email': 'rahul@erms.com',  'department': mkt, 'job_title': 'SEO Specialist', 'employment_type': 'full_time', 'status': 'active',   'hire_date': date(2025, 4, 20), 'salary': 55000, 'gender': 'M'})
        e9, _ = Employee.objects.get_or_create(employee_id='EMP009', defaults={'first_name': 'Anjali', 'last_name': 'Singh',  'email': 'anjali@erms.com', 'department': fin, 'job_title': 'Accountant',     'employment_type': 'full_time', 'status': 'active',   'hire_date': date(2024, 8, 5),  'salary': 62000, 'gender': 'F'})
        self.stdout.write('✅ Employees ready')

        # ── Leave Records ──
        LeaveRecord.objects.get_or_create(employee=e2, leave_type='sick',   start_date=date(2026, 3, 18), end_date=date(2026, 3, 22), defaults={'status': 'approved'})
        LeaveRecord.objects.get_or_create(employee=e3, leave_type='casual', start_date=date(2026, 3, 25), end_date=date(2026, 3, 26), defaults={'status': 'pending'})
        LeaveRecord.objects.get_or_create(employee=e5, leave_type='casual', start_date=date(2026, 3, 28), end_date=date(2026, 3, 29), defaults={'status': 'pending'})
        self.stdout.write('✅ Leave Records ready')

        # ── Attendance ──
        today = date(2026, 3, 21)
        for emp, st in [
            (e1, 'present'), (e2, 'absent'),  (e3, 'present'),
            (e4, 'present'), (e5, 'late'),    (e6, 'present'),
            (e7, 'absent'),  (e8, 'present'), (e9, 'present'),
        ]:
            Attendance.objects.get_or_create(employee=emp, date=today, defaults={'status': st})
        self.stdout.write('✅ Attendance ready')

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Seed complete!\n'
            f'   Departments: {Department.objects.count()}\n'
            f'   Employees:   {Employee.objects.count()}\n'
            f'   Leaves:      {LeaveRecord.objects.count()}\n'
            f'   Attendance:  {Attendance.objects.count()}\n'
        ))
