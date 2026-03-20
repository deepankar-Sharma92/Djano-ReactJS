// src/components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import api from '../../api/api';

export default function Layout({ children, activePage = 'dashboard', onNavigate }) {
  const [stats, setStats] = useState({});
  const [user,  setUser]  = useState({});

  useEffect(() => {
    // DashboardView — for sidebar badges & navbar bell
    api.get('/dashboard/').then((r) => setStats(r.data)).catch(() => {});
    // UserProfileView
    api.get('/profile/').then((r) => setUser(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d1018' }}>
      <Sidebar
        active={activePage}
        stats={stats}
        user={user}
        onNavigate={onNavigate}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar
          activePage={activePage}
          pendingLeaves={stats.pending_leaves || 0}
          user={user}
        />

        {/* Page content rendered here */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
