# 🏢 ERMS — Employee Record Management System

A full-stack **Employee Record Management System** built with **Django REST Framework** (backend) and **ReactJS** (frontend), designed as a production-ready HR administration portal.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.x + Django REST Framework |
| Frontend | ReactJS 18 + Axios |
| Database | SQLite (development) |
| Styling | Inline CSS with design system |
| API | RESTful API with DefaultRouter |

---

## 📁 Project Structure

```
DJANO+REACTJS/
├── Backend/
│   ├── ERMS/
│   │   ├── models.py        # Employee, Department, Attendance, LeaveRecord
│   │   ├── views.py         # ViewSets + DashboardView
│   │   ├── serializers.py   # DRF Serializers
│   │   ├── urls.py          # API Routes
│   │   └── admin.py
│   ├── manage.py
│   └── requirements.txt
│
└── Frontend/
    └── src/
        ├── api/
        │   └── api.js           # Axios instance
        ├── components/
        │   └── layout/
        │       ├── Layout.js    # Main layout wrapper
        │       ├── Navbar.js    # Top navigation bar
        │       └── Sidebar.js   # Side navigation
        ├── pages/
        │   ├── Dashboard.js     # Analytics & stats
        │   ├── Employees.js     # Employee records
        │   └── Attendance.js    # Attendance tracking
        ├── App.js
        └── index.js
```

---

## ⚙️ Backend Setup

```bash
# 1. Navigate to backend
cd Backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Load sample data (optional)
python manage.py shell
# Paste sample data from shell_data.py

# 6. Start server
python manage.py runserver
```

---

## 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

> Frontend runs on `http://localhost:3000`  
> Backend runs on `http://localhost:8000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Stats, dept breakdown, employment types |
| GET/POST | `/api/employees/` | List & create employees |
| GET/PUT/DELETE | `/api/employees/{id}/` | Employee detail |
| GET | `/api/employees/export_summary/` | Export all employees |
| GET/POST | `/api/departments/` | List & create departments |
| GET/POST | `/api/attendance/` | List & mark attendance |
| GET/POST | `/api/leaves/` | List & create leave records |
| PATCH | `/api/leaves/{id}/approve/` | Approve leave request |
| PATCH | `/api/leaves/{id}/reject/` | Reject leave request |

---

## 📊 Features

### Dashboard
- ✅ Total employees, active, on leave counts
- ✅ Department-wise headcount breakdown
- ✅ Employment type distribution (donut chart)
- ✅ New hires this month
- ✅ Pending leave requests with approve/reject

### Employees
- ✅ Full employee listing with search
- ✅ Filter by department, status, employment type
- ✅ Status indicators (Active / On Leave / Inactive)

### Attendance
- ✅ Daily attendance records
- ✅ Filter by date and status
- ✅ Summary stats (Present / Absent / Late / Half Day)
- ✅ Duplicate attendance prevention

---

## 🎯 Assessment Scope

> As per assessment requirements:
- ✅ Single admin user — **no authentication required**
- ✅ Clean, professional UI with consistent typography
- ✅ Reusable components (StatCard, Pill, Layout, etc.)
- ✅ Intuitive navigation with Sidebar + Navbar
- ❌ Payroll — out of scope
- ❌ Advanced HR features — out of scope

---

## 📸 Screenshots

> Dashboard with live stats, employee table, leave management and department breakdown.

---

## 👤 Author

**Deepankar Sharma**  
GitHub: [@deepankar-Sharma92](https://github.com/deepankar-Sharma92)
