// src/pages/Employees.js
import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api.get('/employees/?ordering=last_name')
      .then((r) => setEmployees(r.data.results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.first_name?.toLowerCase().includes(q) ||
      e.last_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.employee_id?.toLowerCase().includes(q)
    );
  });

  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#dc2626)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    'linear-gradient(135deg,#14b8a6,#0d9488)',
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>All Employees</div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
            {employees.length} total records
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#13161f', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '7px 14px', width: '220px',
        }}>
          <span style={{ color: '#475569', fontSize: '13px' }}>🔍</span>
          <input
            style={{ background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontFamily: "'Outfit',sans-serif", fontSize: '13px', width: '100%' }}
            placeholder="Search name, ID, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Employee', 'Email', 'Department', 'Job Title', 'Type', 'Hire Date', 'Status'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: '10.5px', fontWeight: '700',
                    letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b',
                    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>No employees found.</td></tr>
              ) : (
                filtered.map((emp, i) => {
                  const initials = `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}`.toUpperCase();
                  const statusMap = {
                    active:   { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', label: 'Active' },
                    on_leave: { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', label: 'On Leave' },
                    inactive: { bg: 'rgba(244,63,94,0.1)',    color: '#fb7185', label: 'Inactive' },
                  };
                  const st = statusMap[emp.status] || statusMap.active;
                  return (
                    <tr key={emp.id}
                      style={{ transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0,
                          }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#334155', ...mono }}>{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {emp.email}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {emp.department_name || emp.department || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {emp.job_title || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.04)', textTransform: 'capitalize', ...mono }}>
                        {emp.employment_type || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.04)', ...mono }}>
                        {emp.hire_date || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
