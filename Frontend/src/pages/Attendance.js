// src/pages/Attendance.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const STATUS_MAP = {
  present:  { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', label: 'Present',  dot: '#10b981' },
  absent:   { bg: 'rgba(244,63,94,0.1)',    color: '#fb7185', label: 'Absent',   dot: '#f43f5e' },
  late:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', label: 'Late',     dot: '#f59e0b' },
  half_day: { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', label: 'Half Day', dot: '#8b5cf6' },
};

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
];

function Pill({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.present;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: '600',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function StatMini({ label, value, color }) {
  return (
    <div style={{
      background: '#13161f',
      border: `1px solid ${color}30`,
      borderRadius: '10px',
      padding: '14px 18px',
      minWidth: '100px',
    }}>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', ...mono, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#475569', marginTop: '5px', fontWeight: '500' }}>{label}</div>
      <div style={{ height: '2px', background: color, borderRadius: '2px', marginTop: '10px', opacity: 0.7 }} />
    </div>
  );
}

export default function Attendance() {
  const [records,    setRecords]    = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [toast,      setToast]      = useState(null);

  // Mark attendance form — AttendanceViewSet fields
  const [form, setForm] = useState({
    employee:  '',
    date:      new Date().toISOString().split('T')[0],
    status:    'present',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch attendance — AttendanceViewSet ──
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/attendance/?ordering=-date';
      if (filterDate) url += `&date=${filterDate}`;
      if (filterStat) url += `&status=${filterStat}`;

      const [attRes, empRes] = await Promise.all([
        api.get(url),
        api.get('/employees/?ordering=first_name'),
      ]);
      setRecords(attRes.data.results ?? attRes.data);
      setEmployees(empRes.data.results ?? empRes.data);
    } catch {
      showToast('Failed to load attendance.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStat]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Mark Attendance — AttendanceViewSet POST ──
  const handleMark = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.date || !form.status) {
      showToast('Please fill all fields.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/attendance/', {
        employee: parseInt(form.employee),
        date:     form.date,
        status:   form.status,
      });
      showToast('Attendance marked! ✅');
      setShowModal(false);
      setForm({ employee: '', date: new Date().toISOString().split('T')[0], status: 'present' });
      loadData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Attendance already marked for this date.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const count = (s) => records.filter((r) => r.status === s).length;

  return (
    <div style={css.root}>

      {/* Toast */}
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

      {/* Header */}
      <div style={css.header}>
        <div>
          <div style={css.pageTitle}>Attendance</div>
          <div style={css.pageSub}>{records.length} records{filterDate && ` · ${filterDate}`}</div>
        </div>
        <button style={css.addBtn} onClick={() => setShowModal(true)}>
          + Mark Attendance
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatMini label="Total"    value={records.length}   color="#3b82f6" />
        <StatMini label="Present"  value={count('present')} color="#10b981" />
        <StatMini label="Absent"   value={count('absent')}  color="#f43f5e" />
        <StatMini label="Late"     value={count('late')}    color="#f59e0b" />
        <StatMini label="Half Day" value={count('half_day')} color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div style={css.filterBar}>
        <div style={css.filterGroup}>
          <span style={css.filterLabel}>📅 Date</span>
          <input
            type="date"
            style={css.dateInput}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <span style={css.clearBtn} onClick={() => setFilterDate('')}>✕</span>
          )}
        </div>

        <div style={css.filterGroup}>
          <span style={css.filterLabel}>⬤ Status</span>
          <select
            style={css.selectInput}
            value={filterStat}
            onChange={(e) => setFilterStat(e.target.value)}
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
          </select>
        </div>

        {(filterDate || filterStat) && (
          <button style={css.resetBtn}
            onClick={() => { setFilterDate(''); setFilterStat(''); }}>
            Reset
          </button>
        )}

        <button
          style={{ ...css.addBtn, marginLeft: 'auto', padding: '7px 14px', fontSize: '12px' }}
          onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
        >
          📅 Today
        </button>
      </div>

      {/* Table */}
      <div style={css.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={css.table}>
            <thead>
              <tr>
                {['#', 'Employee', 'Date', 'Status'].map((h) => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={css.centerCell}>Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} style={css.centerCell}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => {
                  const name = r.employee_name || `Employee #${r.employee}`;
                  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={r.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...css.td, color: '#1e293b', ...mono, fontSize: '11px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={css.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '800', color: '#fff',
                          }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                            {name}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...css.td, ...mono, fontSize: '11.5px', color: '#64748b' }}>{r.date}</td>
                      <td style={css.td}><Pill status={r.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && records.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '11.5px', color: '#334155' }}>
            Showing <strong style={{ color: '#e2e8f0' }}>{records.length}</strong> records
            {(filterDate || filterStat) && ' (filtered)'}
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <div style={css.overlay} onClick={() => setShowModal(false)}>
          <div style={css.modal} onClick={(e) => e.stopPropagation()}>
            <div style={css.modalHeader}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Mark Attendance</div>
              <span style={{ cursor: 'pointer', color: '#475569', fontSize: '18px' }}
                onClick={() => setShowModal(false)}>✕</span>
            </div>

            <form onSubmit={handleMark} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Employee Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={css.fieldLabel}>Employee <span style={{ color: '#fb7185' }}>*</span></label>
                <select
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  required
                  style={css.selectField}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={css.fieldLabel}>Date <span style={{ color: '#fb7185' }}>*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  style={{ ...css.selectField, colorScheme: 'dark' }}
                />
              </div>

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={css.fieldLabel}>Status <span style={{ color: '#fb7185' }}>*</span></label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['present', 'absent', 'late', 'half_day'].map((s) => {
                    const st = STATUS_MAP[s];
                    const selected = form.status === s;
                    return (
                      <div
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        style={{
                          padding: '7px 14px', borderRadius: '8px',
                          cursor: 'pointer', fontSize: '12.5px', fontWeight: '600',
                          background: selected ? st.bg : 'rgba(255,255,255,0.04)',
                          color: selected ? st.color : '#475569',
                          border: `1px solid ${selected ? st.color + '40' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.15s',
                        }}
                      >
                        {st.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" style={css.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={{ ...css.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? 'Marking…' : '✓ Mark Attendance'}
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
    background: '#0d1018', padding: '24px',
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
  addBtn: {
    padding: '9px 18px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    color: '#fff', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  filterBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    flexWrap: 'wrap',
    background: '#13161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px', padding: '12px 16px',
    marginBottom: '16px',
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '7px' },
  filterLabel: { fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' },
  dateInput: {
    background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '7px', padding: '6px 10px',
    color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11.5px', outline: 'none', colorScheme: 'dark',
  },
  selectInput: {
    background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '7px', padding: '6px 10px',
    color: '#94a3b8', fontFamily: "'Outfit', sans-serif",
    fontSize: '12.5px', outline: 'none', cursor: 'pointer',
  },
  clearBtn: {
    fontSize: '11px', color: '#475569', cursor: 'pointer',
    padding: '2px 6px', borderRadius: '4px',
    background: 'rgba(255,255,255,0.04)',
  },
  resetBtn: {
    padding: '6px 12px', borderRadius: '7px', border: 'none',
    background: 'rgba(244,63,94,0.1)', color: '#fb7185',
    fontSize: '11.5px', fontWeight: '600', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  tableCard: {
    background: '#13161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', overflow: 'hidden',
  },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: '10.5px', fontWeight: '700',
    letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b',
    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  td: {
    padding: '11px 16px', fontSize: '12.5px', color: '#94a3b8',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  centerCell: { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '13px' },
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
    width: '100%', maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '20px',
  },
  fieldLabel: { fontSize: '11.5px', fontWeight: '600', color: '#64748b' },
  selectField: {
    background: '#0d1018',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', padding: '9px 12px',
    color: '#e2e8f0', fontFamily: "'Outfit', sans-serif",
    fontSize: '13px', outline: 'none', cursor: 'pointer', width: '100%',
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
  },
  toast: {
    position: 'fixed', top: '20px', right: '20px',
    padding: '12px 20px', borderRadius: '10px',
    border: '1px solid', fontSize: '13px', fontWeight: '600',
    zIndex: 2000, backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
};
