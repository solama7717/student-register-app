from flask import Flask, request, jsonify, render_template
import pymysql
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# ========== إعداد الاتصال ==========
def get_connection():
    return pymysql.connect(
        host='sql7.freesqldatabase.com',
        user='sql7789263',
        password='ingy01208320446',
        database='sql7789263',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.Cursor  # ← Cursor عادي مش DictCursor
    )

# ========== صفحات HTML ==========
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/confirm.html')
def confirm():
    return render_template('confirm.html')

@app.route('/success.html')
def success():
    return render_template('success.html')

# ========== API: تسجيل الطالب ==========
@app.route('/register', methods=['POST'])
def register_student():
    data = request.get_json()
    try:
        conn = get_connection()
        cur = conn.cursor()

        # تحقق من وجود الاسم مسبقًا
        cur.execute("""
            SELECT COUNT(*) FROM students WHERE name = %s AND guardian_phone = %s
        """, (data['name'], data['guardianPhone']))
        result = cur.fetchone()
        if result and result['count'] > 0:
            cur.close()
            conn.close()
            return jsonify({'error': 'هذا الطالب مسجل بالفعل بهذا الرقم'}), 409

        # إدخال البيانات
        cur.execute("""
            INSERT INTO students 
            (name, student_phone, guardian_phone, whatsapp_phone, subscription_type, gender, grade, days, time, siblings, sibling_name, sibling_grade, hafiz, father_deceased)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['name'],
            data['studentPhone'],
            data['guardianPhone'],
            data['whatsappPhone'],
            data['subscriptionType'],
            data['gender'],
            data['grade'],
            data['days'],
            data['time'],
            data['siblings'],
            data.get('siblingName', ''),
            data.get('siblingGrade', ''),
            int(data['hafiz']),
            int(data['fatherDeceased'])
        ))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': '✅ تم تسجيل الطالب بنجاح'}), 200

    except Exception as e:
        print("❌ Error in /register:", e)
        return jsonify({'error': str(e)}), 500

# ========== API: عدّ الطلاب ==========
@app.route('/count_students', methods=['POST'])
def count_students():
    try:
        data = request.get_json()
        grade = data.get("grade")
        gender = data.get("gender")
        days = data.get("days")
        time = data.get("time")

        # استثناءات
        if grade == "2ثانوي" or (grade == "1ثانوي" and gender == "ولد"):
            return jsonify({"count": 0})

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM students 
            WHERE subscription_type = 'center' AND grade = %s AND gender = %s AND days = %s AND time = %s
        """, (grade, gender, days, time))
        result = cur.fetchone()
        cur.close()
        conn.close()

        count = result['count'] if result else 0
        return jsonify({"count": count})
    except Exception as e:
        print("❌ Error in /count_students:", e)
        return jsonify({"error": str(e)}), 500

# ========== API: التحقق من الاسم ==========
@app.route('/check_name', methods=['POST'])
def check_name():
    try:
        data = request.get_json()
        name = data.get('name')
        guardian_phone = data.get('guardianPhone')

        if not name or not guardian_phone:
            return jsonify({"exists": False})

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM students 
            WHERE name = %s AND guardian_phone = %s
        """, (name, guardian_phone))
        result = cur.fetchone()
        cur.close()
        conn.close()

        exists = result['count'] > 0 if result else False
        return jsonify({"exists": exists})
    except Exception as e:
        print("❌ Error in /check_name:", e)
        return jsonify({'error': str(e)}), 500

# ========== تشغيل التطبيق ==========
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
