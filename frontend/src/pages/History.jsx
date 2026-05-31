import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getSessions, getSubjects, deleteSession } from '../api';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [filterSubject, filterRange]);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await getSessions(filterSubject || null, filterRange);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete session', error);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 className="page-title">Session History</h1>
      
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Filter by Subject</label>
          <select 
            className="input-field" 
            value={filterSubject} 
            onChange={e => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Filter by Date</label>
          <select 
            className="input-field" 
            value={filterRange} 
            onChange={e => setFilterRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="glass-card">
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No sessions found matching the filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessions.map(session => (
              <div key={session.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                    <span className="subject-tag">{session.subject_name}</span>
                    <span style={{ fontWeight: 600 }}>{session.duration} min</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatDate(session.created_at)}
                  </div>
                </div>
                <button 
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(session.id)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
