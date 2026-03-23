// src/components/layout/Navbar.js
import React, { useState } from 'react';

const PAGE_META = {
  dashboard:   { title: 'Dashboard',    sub: 'Overview & live analytics' },
  employees:   { title: 'Employees',    sub: 'Manage all employee records' },
  departments: { title: 'Departments',  sub: 'Organisational structure' },
  attendance:  { title: 'Attendance',   sub: 'Daily check-in / check-out' },
  leaves:      { title: 'Leave Records',sub: 'Approve & track leave requests' },
  reviews:     { title: 'Performance',  sub: 'Reviews & appraisals' },
  profile:     { title: 'My Profile',   sub: 'Account & preferences' },
};

export default function Navbar({ activePage = 'dashboard', onSearch }) {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch && onSearch(e.target.value);
  };

  return (
    <header style={css.navbar}>
      {/* Page title */}
      <div>
        <div style={css.title}>{meta.title}</div>
        <div style={css.sub}>{meta.sub}</div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search ONLY — date, bell, download removed */}
      <div
        style={{
          ...css.search,
          borderColor: focused ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.08)',
          boxShadow:   focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
        }}
      >
        <span style={{ fontSize: '13px', color: '#475569', flexShrink: 0 }}>🔍</span>
        <input
          style={css.searchInput}
          placeholder="Search employees, ID, email…"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {query && (
          <span
            style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { setQuery(''); onSearch && onSearch(''); }}
          >
            ✕
          </span>
        )}
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
    gap: '12px',
    fontFamily: "'Outfit', sans-serif",
    flexShrink: 0,
  },
  title: {
    fontSize: '15px', fontWeight: '700',
    color: '#f1f5f9', letterSpacing: '-0.3px',
  },
  sub:  { fontSize: '11px', color: '#475569', marginTop: '1px' },
  search: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#1a1f2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '7px 14px',
    width: '260px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#e2e8f0',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12.5px',
    width: '100%',
  },
};
