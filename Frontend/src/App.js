// src/App.js
// Assessment: single admin user, no authentication required
import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Employees from './pages/Employees';

// Page registry — add new pages here
const PAGES = {
  dashboard:  <Dashboard />,
  attendance: <Attendance />,
  employees:  <Employees />,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {PAGES[activePage] || <Dashboard />}
    </Layout>
  );
}
