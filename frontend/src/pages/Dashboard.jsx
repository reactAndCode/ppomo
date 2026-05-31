import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStats } from '../api';
import { Flame, Clock, CalendarDays } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    streak: 0,
    total_hours: 0,
    sessions_this_week: 0,
    by_subject: [],
    by_weekday: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  // Format data for Recharts
  const weekdayData = [
    { name: 'Mon', minutes: stats.by_weekday['Mon'] || 0 },
    { name: 'Tue', minutes: stats.by_weekday['Tue'] || 0 },
    { name: 'Wed', minutes: stats.by_weekday['Wed'] || 0 },
    { name: 'Thu', minutes: stats.by_weekday['Thu'] || 0 },
    { name: 'Fri', minutes: stats.by_weekday['Fri'] || 0 },
    { name: 'Sat', minutes: stats.by_weekday['Sat'] || 0 },
    { name: 'Sun', minutes: stats.by_weekday['Sun'] || 0 },
  ];

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 className="page-title">Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--danger)' }}>
            <Flame size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Streak</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.streak} days</div>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--accent-primary)' }}>
            <Clock size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Focus</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.total_hours} hrs</div>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--success)' }}>
            <CalendarDays size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sessions This Week</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.sessions_this_week}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Focus by Subject (minutes)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.by_subject} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {stats.by_subject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Weekly Pattern (minutes)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Bar dataKey="minutes" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
