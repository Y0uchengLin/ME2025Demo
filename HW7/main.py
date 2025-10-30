from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'secret123'  

DB_PATH = os.path.join(os.path.dirname(__file__), 'users.db')

def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''CREATE TABLE teachers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    )''')
        c.execute('''CREATE TABLE grades (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        student_id INTEGER NOT NULL,
                        score INTEGER NOT NULL
                    )''')
        c.executemany("INSERT INTO teachers (username, password) VALUES (?, ?)", [
            ('teacher1', '1234'),
            ('teacher2', 'abcd')
        ])
        conn.commit()
        conn.close()
        print("資料庫已建立！")

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT password FROM teachers WHERE username=?", (username,))
        result = c.fetchone()
        conn.close()

        if result is None:
            flash('錯誤的名稱')
        elif result[0] != password:
            flash('錯誤的密碼')
        else:
            session['teacher'] = username
            return redirect(url_for('grades'))

    return render_template('login.html')

@app.route('/grades', methods=['GET', 'POST'])
def grades():
    if 'teacher' not in session:
        return redirect(url_for('login'))

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    if request.method == 'POST':
        if 'add' in request.form:
            name = request.form['name']
            sid = request.form['sid']
            score = request.form['score']
            if name and sid and score:
                c.execute("INSERT INTO grades (name, student_id, score) VALUES (?, ?, ?)",
                          (name, sid, score))
                conn.commit()
        elif 'delete' in request.form:
            sid = request.form['sid']
            c.execute("DELETE FROM grades WHERE student_id=?", (sid,))
            conn.commit()

    c.execute("SELECT name, student_id, score FROM grades ORDER BY student_id ASC")
    data = c.fetchall()
    conn.close()

    return render_template('grades.html', teacher=session['teacher'], data=data)

@app.route('/logout')
def logout():
    session.pop('teacher', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
