import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Timer as TimerIcon, History, LayoutDashboard } from 'lucide-react';
import TimerPage from './pages/Timer';
import HistoryPage from './pages/History';
import DashboardPage from './pages/Dashboard';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-brand">PomodoroPro</div>
      <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TimerIcon size={20} /> Timer
        </Link>
        <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} /> History
        </Link>
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<TimerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
