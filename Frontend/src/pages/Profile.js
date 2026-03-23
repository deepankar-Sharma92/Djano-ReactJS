// src/pages/Profile.js
import React, { useState } from 'react';

const INITIAL = {
  name:       'HR Admin',
  email:      'admin@erms.com',
  role:       'HR Administrator',
  department: 'Human Resources',
  phone:      '+91 98765 43210',
};

export default function Profile() {
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState(INITIAL);
  const [saved,    setSaved]    = useState(INITIAL);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    setSaved(form);
    setEditing(false);
    showToast('Profile updated successfully! ✅');
  };

  const handleCancel = () => {
    setForm(saved);
    setEditing(false);
  };

  const initials = saved.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const fields = [
    { key: 'name',       label: 'Full Name',  type: 'text',  icon: '👤' },
    { key: 'email',      label: 'Email',      type: 'email', icon: '✉️' },
    { key: 'role',       label: 'Role',       type: 'text',  icon: '🎯' },
    { key: 'department', label: 'Department', type: 'text',  icon: '🏢' },
    { key: 'phone',      label: 'Phone',      type: 'tel',   icon: '📞' },
  ];

  return (
    <div style={css.root}>
      {/* Toast */}
      {toast && (
        <div style={{ ...css.toast,
          background: toast.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
          borderColor: toast.type === 'error' ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
          color: toast.type === 'error' ? '#fb7185' : '#34d399',
        }}>{toast.msg}</div>
      )}

      <div style={css.pageTitle}>My Profile</div>
      <div style={css.pageSub}>Manage your account information</div>

      <div style={{ maxWidth: '560px' }}>
        {/* Avatar card */}
        <div style={css.avatarCard}>
          <div style={css.avatarCircle}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>{saved.name}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{saved.role} · {saved.department}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: '11px', fontWeight: '600' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Active
            </div>
          </div>
          {/* Edit / Save button */}
          {!editing ? (
            <button style={css.editBtn} onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={css.cancelBtn} onClick={handleCancel}>Cancel</button>
              <button style={css.saveBtn} onClick={handleSave}>💾 Save</button>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={css.fieldsCard}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Account Details
          </div>
          {fields.map((f, i) => (
            <div key={f.key} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 0',
              borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: '600' }}>{f.label}</div>
                {editing ? (
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    style={{
                      background: '#0d1018',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '7px',
                      padding: '7px 10px',
                      color: '#e2e8f0',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '13px',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#e2e8f0' }}>
                    {saved[f.key] || '—'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Save button at bottom when editing */}
        {editing && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button style={{ ...css.cancelBtn, flex: 1, padding: '11px' }} onClick={handleCancel}>
              Cancel
            </button>
            <button style={{ ...css.saveBtn, flex: 2, padding: '11px', fontSize: '13px' }} onClick={handleSave}>
              💾 Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const css = {
  root: { flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif", position: 'relative' },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px', marginBottom: '4px' },
  pageSub: { fontSize: '12px', color: '#475569', marginBottom: '24px' },
  avatarCard: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' },
  avatarCircle: { width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff', flexShrink: 0 },
  fieldsCard: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px 24px' },
  editBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  cancelBtn: { padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  saveBtn: { padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '10px', border: '1px solid', fontSize: '13px', fontWeight: '600', zIndex: 2000 },
};
