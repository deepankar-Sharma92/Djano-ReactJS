// src/pages/Attendance.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';  // ✅ fixed: was using wrong import 'dashboardAPI'

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const STATUS_MAP = {
  present:  { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', label: 'Present',  dot: '#10b981' },
  absent:   { bg: 'rgba(244,63,94,0.1)',    color: '#fb7185', label: 'Absent',   dot: '#f43f5e' },
  late:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', label: 'Late',     dot: '#f59e0b' },
  half_day: { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', label: 'Half Day', dot: '#8b5cf6' },
  holiday:  { bg: 'rgba(20,184,166,0.1)',   color: '#2dd4bf', label: 'Holiday',  dot: '#14b8a6' },
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
      minWidth: '110px',
    }}>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', ...mono, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: '#475569', marginTop: '5px', fontWeight: '500' }}>
        {label}
      </div>
      <div style={{ height: '2px', background: color, borderRadius: '2px', marginTop: '10px', opacity: 0.7 }} />
    </div>
  );
}

export default function Attendance() {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filterDate, setFilterDate] = useState('');         // AttendanceViewSet filterset_fields: date
  const [filterStat, setFilterStat] = useState('');         // filterset_fields: status
  const [search,     setSearch]     = useState('');

  // ── fetch from AttendanceViewSet ──
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/attendance/?ordering=-date';
      if (filterDate) url += `&date=${filterDate}`;
      if (filterStat) url += `&status=${filterStat}`;

      const res = await api.get(url);    // ✅ fixed: was using undefined 'API'
      setRecords(res.data.results ?? res.data);
    } catch (err) {
      setError('Failed to load attendance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStat]);

  useEffect(() => { load(); }, [load]);

  // ── client-side name search ──
  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.employee_name?.toLowerCase().includes(q) ||
      String(r.employee)?.includes(q)
    );
  });

  // ── summary counts ──
  const count = (s) => filtered.filter((r) => r.status === s).length;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={css.root}>

      {/* ── Page header ── */}
      <div style={css.pageHeader}>
        <div>
          <div style={css.pageTitle}>Attendance Records</div>
          <div style={css.pageSub}>
            {filtered.length} records
            {filterDate && ` · ${filterDate}`}
          </div>
        </div>

        {/* Mark today shortcut */}
        <button style={css.primaryBtn} onClick={() => setFilterDate(today)}>
          📅 Today
        </button>
      </div>

      {/* ── Summary mini-stats ── */}
      <div style={css.statRow}>
        <StatMini label="Total"    value={filtered.length}  color="#3b82f6" />
        <StatMini label="Present"  value={count('present')} color="#10b981" />
        <StatMini label="Absent"   value={count('absent')}  color="#f43f5e" />
        <StatMini label="Late"     value={count('late')}    color="#f59e0b" />
        <StatMini label="Half Day" value={count('half_day')} color="#8b5cf6" />
        <StatMini label="Holiday"  value={count('holiday')} color="#14b8a6" />
      </div>

      {/* ── Filters — AttendanceViewSet filterset_fields: employee, status, date ── */}
      <div style={css.filterBar}>
        {/* Search */}
        <div style={css.searchBox}>
          <span style={{ color: '#475569', fontSize: '13px' }}>🔍</span>
          <input
            style={css.searchInput}
            placeholder="Search employee name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <span style={{ color: '#475569', cursor: 'pointer', fontSize: '12px' }}
              onClick={() => setSearch('')}>✕</span>
          )}
        </div>

        {/* Date filter */}
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

        {/* Status filter */}
        <div style={css.filterGroup}>
          <span style={css.filterLabel}>⬤ Status</span>
          <select
            style={css.selectInput}
            value={filterStat}
            onChange={(e) => setFilterStat(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>

        {/* Reset */}
        {(filterDate || filterStat || search) && (
          <button style={css.resetBtn}
            onClick={() => { setFilterDate(''); setFilterStat(''); setSearch(''); }}>
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={css.errorBox}>
          ⚠ {error}
          <span style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '12px' }}
            onClick={load}>Retry ↺</span>
        </div>
      )}

      {/* ── Table — AttendanceViewSet fields: employee, date, status ── */}
      <div style={css.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={css.table}>
            <thead>
              <tr>
                {['#', 'Employee', 'Date', 'Status', 'Check In', 'Check Out', 'Notes'].map((h) => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={css.centerCell}>
                    <div style={css.loadingWrap}>
                      <div style={css.spinner} />
                      Loading attendance records…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={css.centerCell}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                    <div style={{ color: '#334155', fontSize: '13px' }}>
                      {filterDate || filterStat ? 'No records match your filters.' : 'No attendance records found.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const name = r.employee_name || `Employee #${r.employee}`;
                  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  const st = STATUS_MAP[r.status] || STATUS_MAP.present;

                  return (
                    <tr
                      key={r.id}
                      style={{ transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Row number */}
                      <td style={{ ...css.td, color: '#1e293b', ...mono, fontSize: '11px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>

                      {/* Employee */}
                      <td style={css.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ ...css.td, ...mono, fontSize: '11.5px', color: '#64748b' }}>
                        {r.date}
                      </td>

                      {/* Status */}
                      <td style={css.td}>
                        <Pill status={r.status} />
                      </td>

                      {/* Check In */}
                      <td style={{ ...css.td, ...mono, fontSize: '11.5px', color: '#475569' }}>
                        {r.check_in || <span style={{ color: '#1e293b' }}>—</span>}
                      </td>

                      {/* Check Out */}
                      <td style={{ ...css.td, ...mono, fontSize: '11.5px', color: '#475569' }}>
                        {r.check_out || <span style={{ color: '#1e293b' }}>—</span>}
                      </td>

                      {/* Notes */}
                      <td style={{ ...css.td, fontSize: '12px', color: '#334155', maxWidth: '160px' }}>
                        <span style={{
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', display: 'block',
                        }}>
                          {r.notes || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row count */}
        {!loading && filtered.length > 0 && (
          <div style={css.tableFooter}>
            Showing <strong style={{ color: '#e2e8f0' }}>{filtered.length}</strong> records
            {(filterDate || filterStat) && ' (filtered)'}
          </div>
        )}
      </div>

    </div>
  );
}

/* ─── Styles ─── */
const css = {
  root: {
    flex: 1, overflowY: 'auto',
    background: '#0d1018',
    padding: '24px',
    fontFamily: "'Outfit', sans-serif",
  },
  pageHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px',
  },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  pageSub:   { fontSize: '12px', color: '#475569', marginTop: '3px' },
  primaryBtn: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
    fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    border: '1px solid rgba(59,130,246,0.25)',
    transition: 'all 0.15s',
  },
  statRow: {
    display: 'flex', gap: '12px', flexWrap: 'wrap',
    marginBottom: '20px',
  },
  filterBar: {
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
    background: '#13161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '7px', padding: '6px 12px', flex: 1, minWidth: '180px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#e2e8f0', fontFamily: "'Outfit', sans-serif",
    fontSize: '12.5px', width: '100%',
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '7px' },
  filterLabel: { fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' },
  dateInput: {
    background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '7px', padding: '6px 10px',
    color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11.5px', outline: 'none',
    colorScheme: 'dark',
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
    marginLeft: 'auto',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
    borderRadius: '10px', padding: '12px 18px',
    color: '#fb7185', fontSize: '13px', marginBottom: '16px',
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
  centerCell: {
    padding: '52px', textAlign: 'center', color: '#334155',
  },
  loadingWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    color: '#334155', fontSize: '13px',
  },
  spinner: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.06)',
    borderTopColor: '#3b82f6',
    animation: 'spin 0.8s linear infinite',
  },
  tableFooter: {
    padding: '10px 16px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    fontSize: '11.5px', color: '#334155',
  },
};

// inject spinner keyframes once
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
if (!document.head.querySelector('[data-erms-spin]')) {
  styleTag.setAttribute('data-erms-spin', '1');
  document.head.appendChild(styleTag);
}
