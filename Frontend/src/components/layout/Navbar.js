// src/components/layout/Navbar.js
import React from 'react';

const PAGE_META = {
  dashboard:   { title: 'Dashboard',    sub: 'Overview & live analytics' },
  employees:   { title: 'Employees',    sub: 'Manage all employee records' },
  departments: { title: 'Departments',  sub: 'Organisational structure' },
  attendance:  { title: 'Attendance',   sub: 'Daily check-in / check-out' },
  leaves:      { title: 'Leave Records',sub: 'Approve & track leave requests' },
  profile:     { title: 'My Profile',   sub: 'Account & preferences' },
};

export default function Navbar({ activePage = 'dashboard' }) {
  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  return (
    <header style={css.navbar}>
      <div>
        <div style={css.title}>{meta.title}</div>
        <div style={css.sub}>{meta.sub}</div>
      </div>
    </header>
  );
}

const css = {
  navbar: {
    height: '64px',
    background: '#0f1117',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    fontFamily: "'Outfit', sans-serif",
    flexShrink: 0,
  },
  title: { fontSize: '15px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  sub:   { fontSize: '11px', color: '#475569', marginTop: '1px' },
};
