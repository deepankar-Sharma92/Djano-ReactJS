// src/App.js
import React, { useState } from 'react';
import Layout      from './components/layout/Layout';
import Dashboard   from './pages/Dashboard';
import Employees   from './pages/Employees';
import Departments from './pages/Departments';
import Attendance  from './pages/Attendance';
import Leaves      from './pages/Leaves';
import Profile     from './pages/Profile';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard   onNavigate={setActivePage} />;
      case 'employees':   return <Employees   />;
      case 'departments': return <Departments />;
      case 'attendance':  return <Attendance  />;
      case 'leaves':      return <Leaves      />;
      case 'profile':     return <Profile     />;
      default:            return <Dashboard   onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}
