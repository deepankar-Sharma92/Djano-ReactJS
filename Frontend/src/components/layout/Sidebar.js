// src/components/layout/Sidebar.js
import React from 'react';

const NAV = [
  {
    section: 'Main',
    items: [
      { id: 'dashboard',   icon: '⊞', label: 'Dashboard' },
      { id: 'employees',   icon: '👥', label: 'Employees',   badgeKey: 'total_employees' },
      { id: 'departments', icon: '🏢', label: 'Departments', badgeKey: 'total_departments' },
    ],
  },
  {
    section: 'HR',
    items: [
      { id: 'attendance', icon: '📅', label: 'Attendance' },
      { id: 'leaves',     icon: '🏖', label: 'Leave Records', badgeKey: 'pending_leaves', warn: true },
      { id: 'reviews',    icon: '📝', label: 'Performance' },
    ],
  },
  {
    section: 'Account',
    items: [
      { id: 'profile', icon: '👤', label: 'My Profile' },
    ],
  },
];

export default function Sidebar({ active = 'dashboard', stats = {}, user = {}, onNavigate }) {
  const initials = (user.username || 'HR').slice(0, 2).toUpperCase();

  return (
    <aside style={css.sidebar}>
      {/* Logo */}
      <div style={css.logoRow}>
        <div style={css.logoMark}>ER</div>
        <div>
          <div style={css.logoText}>
            ERM<span style={{ color: '#60a5fa' }}>S</span>
          </div>
          <div style={css.logoSub}>Record Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={css.nav}>
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div style={css.sectionLabel}>{section}</div>
            {items.map((item) => {
              const isActive = active === item.id;
              const badge = item.badgeKey !== undefined ? stats[item.badgeKey] : undefined;
              return (
                <div
                  key={item.id}
                  style={css.navItem(isActive)}
                  onClick={() => onNavigate && onNavigate(item.id)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <span style={css.navIcon}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge > 0 && (
                    <span style={css.badge(item.warn)}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={css.footer}>
        <div style={css.userCard}>
          <div style={css.avatar}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={css.userName}>{user.username || 'HR Admin'}</div>
            <div style={css.userRole}>{user.email || 'admin@erms.com'}</div>
          </div>
          <span style={{ fontSize: '12px', color: '#334155' }}>⌄</span>
        </div>
      </div>
    </aside>
  );
}

const css = {
  sidebar: {
    width: '240px',
    height: '100vh',
    background: '#0f1117',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Outfit', sans-serif",
    flexShrink: 0,
  },
  logoRow: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 18px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoMark: {
    width: '34px', height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '13px', color: '#fff', flexShrink: 0,
  },
  logoText: { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  logoSub:  { fontSize: '10px', color: '#334155', marginTop: '1px' },
  nav:      { flex: 1, padding: '12px 10px', overflowY: 'auto' },
  sectionLabel: {
    fontSize: '9.5px', fontWeight: '700', letterSpacing: '1.4px',
    textTransform: 'uppercase', color: '#1e293b',
    padding: '14px 10px 5px',
  },
  navItem: (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '9px',
    padding: '9px 12px', borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#60a5fa' : '#64748b',
    background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
    marginBottom: '2px',
    transition: 'all 0.15s',
  }),
  navIcon: { fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 },
  badge: (warn) => ({
    background: warn ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.15)',
    color: warn ? '#f59e0b' : '#60a5fa',
    fontSize: '10px', fontWeight: '700',
    padding: '2px 7px', borderRadius: '20px',
    fontFamily: "'JetBrains Mono', monospace",
  }),
  footer: {
    padding: '12px 10px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px',
    background: '#1a1f2e',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0,
  },
  userName: {
    fontSize: '12.5px', fontWeight: '600', color: '#e2e8f0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '10.5px', color: '#334155',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
};
