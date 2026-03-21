// src/pages/Employees.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
];

const STATUS_MAP = {
  active:   { bg: 'rgba(16,185,129,0.12)', color: '#34d399', label: 'Active' },
  on_leave: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'On Leave' },
  inactive: { bg: 'rgba(244,63,94,0.1)',   color: '#fb7185', label: 'Inactive' },
};

// ── Reusable Input ──
function Field({ label, type = 'text', value, onChange, placeholder, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748b' }}>
        {label} {required && <span style={{ color: '#fb7185' }}>*</span>}
      </label>
      {children || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            background: '#0d1018',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '9px 12px',
            color: '#e2e8f0',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            outline: 'none',
          }}
        />
      )}
    </div>
  );
}

export default function Employees() {
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [toast,       setToast]       = useState(null);

  // Form state — matches EmployeeViewSet fields
  const [form, setForm] = useState({
    employee_id: '',
    first_name:  '',
    last_name:   '',
    email:       '',
    department:  '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch employees — EmployeeViewSet list ──
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees/?ordering=last_name'),
        api.get('/departments/'),
      ]);
      setEmployees(empRes.data.results ?? empRes.data);
      setDepartments(deptRes.data.results ?? deptRes.data);
    } catch {
      showToast('Failed to load employees.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  // ── Add Employee — EmployeeViewSet POST ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.first_name || !form.last_name || !form.email || !form.department) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/employees/', {
        ...form,
        department: parseInt(form.department),
        status: 'active',
        employment_type: 'full_time',
        gender: 'M',
        salary: 0,
        hire_date: new Date().toISOString().split('T')[0],
      });
      showToast('Employee added successfully! ✅');
      setShowModal(false);
      setForm({ employee_id: '', first_name: '', last_name: '', email: '', department: '' });
      loadEmployees();
    } catch (err) {
      const msg = err.response?.data?.employee_id?.[0] || 'Failed to add employee.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Employee — EmployeeViewSet DELETE ──
  const handleDelete = async (id) => {
    try {
      setDeleteId(id);
      await api.delete(`/employees/${id}/`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      showToast('Employee deleted. 🗑️');
    } catch {
      showToast('Failed to delete employee.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.first_name?.toLowerCase().includes(q) ||
      e.last_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.employee_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={css.root}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          ...css.toast,
          background: toast.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
          borderColor: toast.type === 'error' ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
          color: toast.type === 'error' ? '#fb7185' : '#34d399',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={css.header}>
        <div>
          <div style={css.pageTitle}>Employees</div>
          <div style={css.pageSub}>{employees.length} total records</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Search */}
          <div style={css.searchBox}>
            <span style={{ color: '#475569', fontSize: '13px' }}>🔍</span>
            <input
              style={css.searchInput}
              placeholder="Search name, ID, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Add Button */}
          <button style={css.addBtn} onClick={() => setShowModal(true)}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={css.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={css.table}>
            <thead>
              <tr>
                {['Employee', 'Email', 'Department', 'Job Title', 'Hire Date', 'Status', 'Action'].map((h) => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={css.centerCell}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={css.centerCell}>No employees found.</td></tr>
              ) : (
                filtered.map((emp, i) => {
                  const initials = `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}`.toUpperCase();
                  const st = STATUS_MAP[emp.status] || STATUS_MAP.active;
                  return (
                    <tr key={emp.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={css.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ ...css.avatar, background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                            {initials}
                          </div>
                          <div>
                            <div style={css.empName}>{emp.first_name} {emp.last_name}</div>
                            <div style={css.empId}>{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...css.td, fontSize: '12px', color: '#64748b' }}>{emp.email}</td>
                      <td style={css.td}>{emp.department_name || emp.department || '—'}</td>
                      <td style={css.td}>{emp.job_title || '—'}</td>
                      <td style={{ ...css.td, ...mono, fontSize: '11px', color: '#475569' }}>{emp.hire_date || '—'}</td>
                      <td style={css.td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '2px 9px', borderRadius: '20px',
                          background: st.bg, color: st.color,
                          fontSize: '11px', fontWeight: '600',
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {st.label}
                        </span>
                      </td>
                      <td style={css.td}>
                        <button
                          style={css.deleteBtn}
                          disabled={deleteId === emp.id}
                          onClick={() => {
                            if (window.confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) {
                              handleDelete(emp.id);
                            }
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
                        >
                          {deleteId === emp.id ? '…' : '🗑 Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Employee Modal ── */}
      {showModal && (
        <div style={css.overlay} onClick={() => setShowModal(false)}>
          <div style={css.modal} onClick={(e) => e.stopPropagation()}>
            <div style={css.modalHeader}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Add New Employee</div>
              <span style={{ cursor: 'pointer', color: '#475569', fontSize: '18px' }} onClick={() => setShowModal(false)}>✕</span>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Employee ID */}
              <Field label="Employee ID" value={form.employee_id} required
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                placeholder="e.g. EMP010" />

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="First Name" value={form.first_name} required
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="First name" />
                <Field label="Last Name" value={form.last_name} required
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Last name" />
              </div>

              {/* Email */}
              <Field label="Email Address" type="email" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@company.com" />

              {/* Department */}
              <Field label="Department" required>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                  style={{
                    background: '#0d1018',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    color: form.department ? '#e2e8f0' : '#475569',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" style={css.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={{ ...css.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? 'Adding…' : '+ Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const css = {
  root: {
    flex: 1, overflowY: 'auto',
    background: '#0d1018',
    padding: '24px',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
  },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  pageSub:   { fontSize: '12px', color: '#475569', marginTop: '3px' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#13161f', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px', padding: '8px 14px', width: '220px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#e2e8f0', fontFamily: "'Outfit', sans-serif",
    fontSize: '12.5px', width: '100%',
  },
  addBtn: {
    padding: '9px 18px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
    transition: 'opacity 0.15s',
  },
  tableCard: {
    background: '#13161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: '10.5px', fontWeight: '700',
    letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b',
    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 16px', fontSize: '12.5px', color: '#94a3b8',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  centerCell: { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '13px' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0,
  },
  empName: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0' },
  empId:   { fontSize: '10.5px', color: '#334155', fontFamily: "'JetBrains Mono', monospace" },
  deleteBtn: {
    padding: '4px 12px', borderRadius: '6px', fontSize: '11.5px',
    fontWeight: '600', cursor: 'pointer', border: 'none',
    background: 'rgba(244,63,94,0.1)', color: '#fb7185',
    transition: 'background 0.15s', fontFamily: "'Outfit', sans-serif",
  },
  // Modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#13161f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', padding: '24px',
    width: '100%', maxWidth: '460px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '20px',
  },
  cancelBtn: {
    flex: 1, padding: '10px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748b', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  submitBtn: {
    flex: 2, padding: '10px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
    transition: 'opacity 0.15s',
  },
  toast: {
    position: 'fixed', top: '20px', right: '20px',
    padding: '12px 20px', borderRadius: '10px',
    border: '1px solid', fontSize: '13px', fontWeight: '600',
    zIndex: 2000, backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
};
