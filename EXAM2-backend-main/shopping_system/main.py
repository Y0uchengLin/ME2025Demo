from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from datetime import datetime
import sqlite3
import logging
import re
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Session 需要

# -------------------- 資料庫 --------------------
DB_FILE = os.path.join(os.path.dirname(__file__), 'shopping_data.db')

@app.route('/index')
def index():
    if 'username' not in session:
        return redirect(url_for('page_login_'))
    return render_template('index.html')

def get_db_connection():
    if not os.path.exists(DB_FILE):
        logging.error(f"Database file not found at {DB_FILE}")
        return None
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


# -------------------- 登入檢查 --------------------
def login_user(username, password):
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "無法連接資料庫"}
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
        user = cursor.fetchone()
        if user:
            return {"status": "success", "message": "登入成功"}
        else:
            return {"status": "error", "message": "帳號或密碼錯誤"}
    except sqlite3.Error as e:
        logging.error(f"Database query error: {e}")
        return {"status": "error", "message": "發生資料庫錯誤"}
    finally:
        conn.close()


# -------------------- 首頁 --------------------
@app.route('/')
def home_redirect():
    return redirect(url_for('page_login_'))

# -------------------- 登入 --------------------
@app.route('/page_login_', methods=['GET', 'POST'])
def page_login_():
    try:
        if request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                username = data.get('username')
                password = data.get('password')
            else:
                username = request.form.get('username')
                password = request.form.get('password')

            if not username or not password:
                return jsonify({"status": "error", "message": "請填寫完整資料"})

            result = login_user(username, password)
            if result["status"] == "success":
                session['username'] = username
            return jsonify(result)
        return render_template('page_login_.html')
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- 註冊 --------------------
@app.route('/page_register', methods=['GET', 'POST'])
def page_register():
    if request.method == 'POST':
        # 判斷 JSON 或表單
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
        else:
            username = request.form.get('username')
            password = request.form.get('password')
            email = request.form.get('email')

        if not username or not password or not email:
            return jsonify({"status": "error", "message": "請填寫完整資料"})

        conn = get_db_connection()
        cursor = conn.cursor()

        # 帳號是否存在
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            cursor.execute("UPDATE users SET password=?, email=? WHERE username=?", (password, email, username))
            conn.commit()
            conn.close()
            return jsonify({"status": "success", "message": "帳號已存在，成功修改密碼或信箱"})

        # 密碼規則
        if len(password) < 8 or not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password):
            return jsonify({"status": "error", "message": "密碼必須超過8個字元且包含英文大小寫，重新輸入"})

        # Email 格式
        if not re.match(r'^[\w.-]+@gmail\.com$', email):
            return jsonify({"status": "error", "message": "Email 格式不符重新輸入"})

        cursor.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", (username, password, email))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "註冊成功，請登入"})

    return render_template('page_register.html')

# -------------------- 登出 --------------------
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('page_login_'))

# -------------------- 下單 --------------------
@app.route('/place_order', methods=['POST'])
def place_order():
    if 'username' not in session:
        return jsonify({"status": "error", "message": "尚未登入"})

    data = request.get_json()
    order_items = data.get('items', [])

    if not order_items:
        return jsonify({"status": "error", "message": "沒有選擇任何商品"})

    conn = get_db_connection()
    cursor = conn.cursor()
    total_sum = 0
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    try:
        for item in order_items:
            name = item['name']
            price = int(item['price'])
            qty = int(item['qty'])
            total = price * qty
            total_sum += total

            cursor.execute('''
                INSERT INTO shop_list_table (Product, Price, Number, "Total Price", Date, Time)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (name, price, qty, total, date_str, time_str))

        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({"status": "error", "message": f"發生資料庫錯誤: {e}"})
    finally:
        conn.close()

    return jsonify({"status": "success", "message": f"已成功下單，總金額 {total_sum} NT"})

# -------------------- 啟動 --------------------
if __name__ == '__main__':
    app.run(debug=True)
