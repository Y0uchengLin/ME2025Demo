import sqlite3

# ====== 1. 英文字母對應代碼 ======
city_code = {
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
    'I': 34, 'J': 18, 'K': 19, 'L': 20, 'M': 21, 'N': 22, 'O': 35, 'P': 23,
    'Q': 24, 'R': 25, 'S': 26, 'T': 27, 'U': 28, 'V': 29, 'W': 32, 'X': 30,
    'Y': 31, 'Z': 33
}

city_name = {
    'A': '臺北市', 'B': '臺中市', 'C': '基隆市', 'D': '臺南市', 'E': '高雄市',
    'F': '新北市', 'G': '宜蘭縣', 'H': '桃園市', 'I': '嘉義市', 'J': '新竹縣',
    'K': '苗栗縣', 'L': '台中縣', 'M': '南投縣', 'N': '彰化縣', 'O': '新竹市',
    'P': '雲林縣', 'Q': '嘉義縣', 'R': '台南縣', 'S': '高雄縣', 'T': '屏東縣',
    'U': '花蓮縣', 'V': '台東縣', 'W': '金門縣', 'X': '澎湖縣', 'Y': '陽明山', 'Z': '連江縣'
}

# ====== 2. 驗證身分證 ======
def check_id(id_str):
    id_str = id_str.strip().upper()
    if len(id_str) != 10:
        return False
    first_letter = id_str[0]
    if first_letter not in city_code:
        return False
    if not id_str[1:].isdigit():
        return False
    # 第二碼必須是 1, 2, 8, 9
    if id_str[1] not in ['1', '2', '8', '9']:
        return False
    n = city_code[first_letter]
    n1, n2 = divmod(n, 10)
    nums = [n1, n2] + [int(x) for x in id_str[1:]]
    weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
    total = sum(a * b for a, b in zip(nums, weights))
    return total % 10 == 0

# ====== 3. 補驗證碼 ======
def generate_check_digit(id_9):
    id_9 = id_9.strip().upper()
    if len(id_9) != 9:
        return None
    # 第二碼必須是 1, 2, 8, 9
    if id_9[1] not in ['1', '2', '8', '9']:
        return None
    for i in range(10):
        candidate = id_9 + str(i)
        if check_id(candidate):
            return candidate
    return None

# ====== 4. 連接資料庫 ======
conn = sqlite3.connect("ID_data.db")
cursor = conn.cursor()

# ====== 5. 讀取資料 ======
cursor.execute("SELECT rowid, ID FROM ID_table")
records = cursor.fetchall()

valid = []
invalid = []

for rowid, id_ in records:
    id_clean = id_.strip().upper()

    # 補驗證碼
    if len(id_clean) == 9:
        new_id = generate_check_digit(id_clean)
        if new_id:
            cursor.execute("UPDATE ID_table SET ID = ? WHERE rowid = ?", (new_id, rowid))
            valid.append(new_id)
        else:
            invalid.append(id_)
    elif len(id_clean) == 10:
        # 第二碼篩選 + 驗證碼檢查
        if check_id(id_clean):
            valid.append(id_clean)
        else:
            invalid.append(id_)
    else:
        invalid.append(id_)

# ====== 6. 批次刪除不合法 ID（處理前後空格） ======
if invalid:
    placeholders = ','.join('?' for _ in invalid)
    sql = f"DELETE FROM ID_table WHERE TRIM(ID) IN ({placeholders})"
    cursor.execute(sql, [x.strip() for x in invalid])

# ====== 7. 更新 country / gender / citizenship ======
cursor.execute("SELECT rowid, ID FROM ID_table")
for rowid, id_ in cursor.fetchall():
    id_clean = id_.strip().upper()
    city = city_name.get(id_clean[0], '未知地區')

    # 第二碼：性別（修正版）
    gender_code = id_clean[1]
    if gender_code in ['1', '8']:
        gender_text = '男性'
    elif gender_code in ['2', '9']:
        gender_text = '女性'
    else:
        gender_text = '未知'

    # 第三碼：出生地/入籍類別
    third_code = id_clean[2]
    citizenship_map = {
        '0': '台灣出生之本籍國民',
        '1': '台灣出生之本籍國民',
        '2': '台灣出生之本籍國民',
        '3': '台灣出生之本籍國民',
        '4': '台灣出生之本籍國民',
        '5': '台灣出生之本籍國民',
        '6': '入籍國民，原為外國人',
        '7': '入籍國民，原為無戶籍國民',
        '8': '入籍國民，原為港澳居民',
        '9': '入籍國民，原為大陸地區居民'
    }
    citizenship = citizenship_map.get(third_code, '未知')

    cursor.execute(
        "UPDATE ID_table SET country=?, gender=?, citizenship=? WHERE rowid=?",
        (city, gender_text, citizenship, rowid)
    )
# ====== 8. 一次 commit，確保所有更新與刪除生效 ======
conn.commit()
conn.close()

print(f"✅ 已更新 {len(valid)} 筆合法身分證")
print(f"❌ 已刪除 {len(invalid)} 筆不合法身分證（含第二碼非 1/2/8/9）")
print("🎉 所有資料已處理完成！")

# ====== 9. 可互動查詢 ======
def explain_id(id_str):
    id_clean = id_str.strip().upper()
    city = city_name.get(id_clean[0], '未知地區')

    # 第二碼：性別
    if id_clean[1] == '1':
        gender = '男性'
    elif id_clean[1] == '2':
        gender = '女性'
    elif id_clean[1] in ['8', '9']:
        gender = '居留證持有人'
    else:
        gender = '未知'

    # 第三碼：出生地/入籍類別
    third_code = id_clean[2]
    citizenship_map = {
        '0': '台灣出生之本籍國民',
        '1': '台灣出生之本籍國民',
        '2': '台灣出生之本籍國民',
        '3': '台灣出生之本籍國民',
        '4': '台灣出生之本籍國民',
        '5': '台灣出生之本籍國民',
        '6': '入籍國民，原為外國人',
        '7': '入籍國民，原為無戶籍國民',
        '8': '入籍國民，原為港澳居民',
        '9': '入籍國民，原為大陸地區居民'
    }
    citizenship = citizenship_map.get(third_code, '未知')

    return f"{id_clean}：{city}、{gender}、{citizenship}"

user_input = input("請輸入  身分證字號：").upper()
if check_id(user_input):
    print(explain_id(user_input))
else:
    print("請重新輸入。")
