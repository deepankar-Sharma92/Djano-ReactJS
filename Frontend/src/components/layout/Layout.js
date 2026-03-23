// src/components/layout/Layout.js
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import api     from '../../api/api';

export default function Layout({ children, activePage = 'dashboard', onNavigate }) {
  const [stats, setStats] = useState({});
  const [user,  setUser]  = useState({});

  useEffect(() => {
    api.get('/dashboard/').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#0d1018',
    }}>
      <Sidebar
        active={activePage}
        stats={stats}
        user={user}
        onNavigate={onNavigate}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',   // ← prevent outer scroll
        minHeight: 0,
      }}>
        <Navbar activePage={activePage} />

        {/* ── scrollable content area ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',   // ← each page scrolls here
          overflowX: 'hidden',
          minHeight: 0,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
