import sqlite3
import re

# ====== 初始化資料庫 ======
conn = sqlite3.connect("user.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
""")
conn.commit()

# ====== 驗證 Email 格式 ======
def valid_email(email):
    return re.fullmatch(r"[A-Za-z0-9._%+-]+@gmail\.com", email) is not None

# ====== 驗證密碼規則 ======
def valid_password(pw):
    errors = []
    if len(pw) < 8:
        errors.append("密碼必須超過8個字元")
    if not re.search(r"[A-Z]", pw):
        errors.append("需包含大寫英文")
    if not re.search(r"[a-z]", pw):
        errors.append("需包含小寫英文")
    if not re.search(r"[\W_]", pw):
        errors.append("需包含特殊字元")
    # 禁止連號（例如 123, 234, 345 等）
    for i in range(len(pw) - 2):
        if pw[i].isdigit() and pw[i+1].isdigit() and pw[i+2].isdigit():
            if int(pw[i+1]) == int(pw[i]) + 1 and int(pw[i+2]) == int(pw[i]) + 2:
                errors.append("不可以連號")
                break
    return errors

# ====== 註冊模式 ======
def signup():
    print("=== 註冊模式 ===")
    name = input("請輸入名稱：").strip()
    
    # Email 檢查
    while True:
        email = input("請輸入Email (需為@gmail.com)：").strip()
        if valid_email(email):
            break
        print("⚠️ Email格式不符，重新輸入")

    # 密碼檢查
    while True:
        password = input("請輸入密碼：").strip()
        pw_errors = valid_password(password)
        if not pw_errors:
            break
        print("⚠️ " + "、".join(pw_errors) + "，重新輸入")

    print(f"save{name} | {email} | {password} | Y/N ?")
    confirm = input("是否儲存 (Y/N)：").strip().upper()
    if confirm != "Y":
        print("返回主畫面")
        return

    # 檢查 email 是否存在
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    existing = cursor.fetchone()
    if existing:
        print("⚠️ 此 Email 已存在，是否更新資料？(Y/N)")
        if input(">").strip().upper() == "Y":
            cursor.execute("UPDATE users SET name=?, password=? WHERE email=?", (name, password, email))
            print("✅ 已更新資料！")
        else:
            print("返回主畫面")
            return
    else:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, password))
        print("✅ 新用戶已註冊！")

    conn.commit()

# ====== 登入模式 ======
def signin():
    print("=== 登入模式 ===")
    name = input("請輸入名稱：").strip()
    email = input("請輸入Email：").strip()

    cursor.execute("SELECT * FROM users WHERE name=? AND email=?", (name, email))
    user = cursor.fetchone()
    if not user:
        print("⚠️ 名字或Email錯誤")
        return

    # 檢查密碼
    while True:
        pw = input("請輸入密碼：").strip()
        if pw == user[3]:
            print("🎉 登入成功！歡迎", user[1])
            break
        else:
            print("⚠️ 密碼錯誤，忘記密碼 Y/N？")
            choice = input(">").strip().upper()
            if choice == "Y":
                signup()
                return
            else:
                print("請重新輸入密碼")

# ====== 主程式 ======
def main():
    while True:
        print("\n(a) Sign up  /  (b) Sign in  /  (q) 離開")
        choice = input("請選擇：").strip().lower()
        if choice == "a":
            signup()
        elif choice == "b":
            signin()
        elif choice == "q":
            print("再見！")
            break
        else:
            print("請輸入 a, b, 或 q")

if __name__ == "__main__":
    main()
    conn.close()
