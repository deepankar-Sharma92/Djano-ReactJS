// src/pages/Profile.js
import React from 'react';

export default function Profile() {
  const info = [
    { label: 'Name',       value: 'HR Admin' },
    { label: 'Email',      value: 'admin@erms.com' },
    { label: 'Role',       value: 'HR Administrator' },
    { label: 'Access',     value: 'Full Access' },
    { label: 'Department', value: 'Human Resources' },
  ];

  return (
    <div style={css.root}>
      <div style={css.pageTitle}>My Profile</div>
      <div style={css.pageSub}>Account information</div>

      <div style={css.card}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff' }}>
            HR
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>HR Admin</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>HR Administrator · Full Access</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: '11px', fontWeight: '600' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Active
            </div>
          </div>
        </div>

        {info.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '500' }}>{item.label}</span>
            <span style={{ fontSize: '12.5px', color: '#e2e8f0', fontWeight: '600' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const css = {
  root: { flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif" },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px', marginBottom: '4px' },
  pageSub: { fontSize: '12px', color: '#475569', marginBottom: '24px' },
  card: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', maxWidth: '500px' },
};
