import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Trash2 } from 'lucide-react';
import { getSubjects, createSubject, deleteSubject, createSession } from '../api';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const TimerPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [endTime, setEndTime] = useState(null);

  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    fetchSubjects();
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isActive && state.endTime) {
        const now = Math.floor(Date.now() / 1000);
        const remaining = state.endTime - now;
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsActive(true);
          setIsBreak(state.isBreak);
          setEndTime(state.endTime);
          setSelectedSubjectId(state.selectedSubjectId);
        } else {
          handleTimerComplete(state.isBreak, state.selectedSubjectId);
        }
      } else {
        setTimeLeft(state.timeLeft || FOCUS_TIME);
        setIsBreak(state.isBreak || false);
        setSelectedSubjectId(state.selectedSubjectId || '');
      }
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && endTime) {
      interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          handleTimerComplete(isBreak, selectedSubjectId);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, endTime, isBreak, selectedSubjectId]);

  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify({
      isActive,
      isBreak,
      endTime,
      timeLeft,
      selectedSubjectId
    }));
  }, [isActive, isBreak, endTime, timeLeft, selectedSubjectId]);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const newSub = await createSubject(newSubjectName);
      setSubjects([...subjects, newSub]);
      setNewSubjectName('');
    } catch (error) {
      console.error('Failed to create subject', error);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      if (selectedSubjectId === id.toString()) {
        setSelectedSubjectId('');
      }
    } catch (error) {
      console.error('Failed to delete subject', error);
    }
  };

  const handleTimerComplete = async (wasBreak, subjectId) => {
    audioRef.current.play().catch(e => console.log('Audio play failed', e));
    setIsActive(false);
    setEndTime(null);

    if (!wasBreak) {
      if (subjectId) {
        try {
          await createSession(subjectId, 25);
        } catch (error) {
          console.error('Failed to save session', error);
        }
      }
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
      startTimer(BREAK_TIME, true);
    } else {
      setIsBreak(false);
      setTimeLeft(FOCUS_TIME);
    }
  };

  const startTimer = (duration = null, asBreak = null) => {
    const isCurrentlyBreak = asBreak !== null ? asBreak : isBreak;
    if (!isCurrentlyBreak && !selectedSubjectId) {
      alert('Please select a subject first!');
      return;
    }
    const durationToUse = duration || timeLeft;
    const now = Math.floor(Date.now() / 1000);
    setEndTime(now + durationToUse);
    setIsActive(true);
    if (asBreak !== null) {
      setIsBreak(asBreak);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    setEndTime(null);
  };

  const resetTimer = () => {
    setIsActive(false);
    setEndTime(null);
    setTimeLeft(isBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <h1 className="page-title">{isBreak ? 'Break Time' : 'Focus Session'}</h1>

      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div className="timer-circle" style={{ marginBottom: '2rem' }}>
          <svg className="timer-svg" viewBox="0 0 300 300">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
            <circle className="timer-circle-bg" cx="150" cy="150" r="140" />
            <circle 
              className="timer-circle-progress" 
              cx="150" 
              cy="150" 
              r="140"
              strokeDasharray={circumference}
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="timer-time" style={{ color: isBreak ? 'var(--success)' : 'var(--text-primary)' }}>
            {formatTime(timeLeft)}
          </div>
          <div className="timer-status">
            {isActive ? 'Running' : 'Paused'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {isActive ? (
            <button className="btn btn-secondary" onClick={pauseTimer}>
              <Pause size={20} /> Pause
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => startTimer()}>
              <Play size={20} /> Start
            </button>
          )}
          <button className="btn btn-secondary" onClick={resetTimer}>
            <Square size={20} /> Reset
          </button>
        </div>

        {!isBreak && (
          <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Select Subject</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {subjects.map(sub => (
                <div 
                  key={sub.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    background: selectedSubjectId === sub.id.toString() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedSubjectId === sub.id.toString() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => !isActive && setSelectedSubjectId(sub.id.toString())}
                >
                  <span>{sub.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateSubject} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="New subject name..." 
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                <Plus size={20} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default TimerPage;
