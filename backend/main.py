from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'pomodoro.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER NOT NULL,
                duration INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (subject_id) REFERENCES subjects (id)
            )
        ''')
        # Insert default subjects if empty
        cur = conn.execute("SELECT COUNT(*) FROM subjects")
        if cur.fetchone()[0] == 0:
            conn.execute("INSERT INTO subjects (name) VALUES ('Work'), ('Reading'), ('Study')")
        conn.commit()

init_db()

@app.route('/subjects', methods=['GET'])
def get_subjects():
    with get_db() as conn:
        cur = conn.execute("SELECT id, name FROM subjects")
        return jsonify([dict(row) for row in cur.fetchall()])

@app.route('/subjects', methods=['POST'])
def add_subject():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Name is required"}), 400
    with get_db() as conn:
        try:
            cur = conn.execute("INSERT INTO subjects (name) VALUES (?)", (name,))
            conn.commit()
            return jsonify({"id": cur.lastrowid, "name": name}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "Subject already exists"}), 400

@app.route('/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    with get_db() as conn:
        conn.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
        conn.execute("DELETE FROM sessions WHERE subject_id = ?", (subject_id,))
        conn.commit()
        return jsonify({"success": True})

@app.route('/sessions', methods=['GET'])
def get_sessions():
    subject_id = request.args.get('subject_id')
    time_range = request.args.get('range', 'all')
    
    query = """
        SELECT s.id, s.subject_id, sub.name as subject_name, s.duration, s.created_at
        FROM sessions s
        JOIN subjects sub ON s.subject_id = sub.id
        WHERE 1=1
    """
    params = []
    
    if subject_id:
        query += " AND s.subject_id = ?"
        params.append(subject_id)
        
    now = datetime.now()
    if time_range == 'week':
        start = now - timedelta(days=7)
        query += " AND s.created_at >= ?"
        params.append(start.isoformat())
    elif time_range == 'month':
        start = now - timedelta(days=30)
        query += " AND s.created_at >= ?"
        params.append(start.isoformat())
        
    query += " ORDER BY s.created_at DESC"
    
    with get_db() as conn:
        cur = conn.execute(query, params)
        sessions = [dict(row) for row in cur.fetchall()]
        return jsonify(sessions)

@app.route('/sessions', methods=['POST'])
def add_session():
    data = request.json
    subject_id = data.get('subject_id')
    duration = data.get('duration')
    
    if not subject_id or not duration:
        return jsonify({"error": "Missing data"}), 400
        
    created_at = datetime.now().isoformat()
    
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (subject_id, duration, created_at) VALUES (?, ?, ?)",
            (subject_id, duration, created_at)
        )
        conn.commit()
        
        return jsonify({
            "id": cur.lastrowid,
            "subject_id": subject_id,
            "duration": duration,
            "created_at": created_at
        }), 201

@app.route('/sessions/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        return jsonify({"success": True})

@app.route('/stats', methods=['GET'])
def get_stats():
    with get_db() as conn:
        cur = conn.execute('''
            SELECT s.duration, s.created_at, sub.name as subject_name 
            FROM sessions s
            JOIN subjects sub ON s.subject_id = sub.id
        ''')
        sessions = cur.fetchall()

    total_minutes = sum(s['duration'] for s in sessions)
    total_hours = round(total_minutes / 60, 1)

    now = datetime.now()
    week_start = now - timedelta(days=7)
    sessions_this_week = sum(1 for s in sessions if datetime.fromisoformat(s['created_at']) >= week_start)

    by_subject_dict = {}
    for s in sessions:
        name = s['subject_name']
        by_subject_dict[name] = by_subject_dict.get(name, 0) + s['duration']
    
    by_subject = [{"name": k, "minutes": v} for k, v in by_subject_dict.items()]

    by_weekday_dict = {day: 0 for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    for s in sessions:
        try:
            dt = datetime.fromisoformat(s['created_at'])
            day_str = dt.strftime("%a")
            if day_str in by_weekday_dict:
                by_weekday_dict[day_str] += s['duration']
        except ValueError:
            pass

    # Calculate streak (consecutive days)
    dates = sorted(set(datetime.fromisoformat(s['created_at']).date() for s in sessions), reverse=True)
    streak = 0
    current_date = now.date()
    
    if dates and (dates[0] == current_date or dates[0] == current_date - timedelta(days=1)):
        expected_date = dates[0]
        for d in dates:
            if d == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break

    return jsonify({
        "streak": streak,
        "total_hours": total_hours,
        "sessions_this_week": sessions_this_week,
        "by_subject": by_subject,
        "by_weekday": by_weekday_dict
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
