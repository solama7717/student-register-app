from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS
import os
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# إعداد الاتصال بقاعدة البيانات
app.config['MYSQL_HOST'] = 'sql7.freesqldatabase.com'
app.config['MYSQL_USER'] = 'sql7789263'
app.config['MYSQL_PASSWORD'] = 'ingy01208320446'
app.config['MYSQL_DB'] = 'sql7789263'

mysql = MySQL(app)

# ==== صفحات HTML ====
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/confirm.html')
def confirm():
    return render_template('confirm.html')

@app.route('/success.html')
def success():
    return render_template('success.html')

# ==== API ====
@app.route('/register', methods=['POST'])
def register_student():
    data = request.get_json()
    try:
        # تحقق أولًا هل الاسم مع رقم ولي الأمر مسجل بالفعل
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM students 
            WHERE name = %s AND guardian_phone = %s
        """, (data['name'], data['guardianPhone']))
        if cur.fetchone()[0] > 0:
            cur.close()
            return jsonify({'error': 'هذا الطالب مسجل بالفعل بهذا الرقم'}), 409

        # ثم أضف البيانات إن لم يكن موجودًا
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
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': '✅ تم تسجيل الطالب بنجاح'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/count_students', methods=['POST'])
def count_students():
    try:
        data = request.get_json()

        grade = data.get("grade")
        gender = data.get("gender")
        days = data.get("days")
        time = data.get("time")

        # استثناء الصف الثاني الثانوي بالكامل، والصف الأول الثانوي ولاد فقط
        if grade == "2ثانوي" or (grade == "1ثانوي" and gender == "ولد"):
            return jsonify({"count": 0})  # كأن العدد صفر دائمًا

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM students 
            WHERE subscription_type = 'center' AND grade = %s AND gender = %s AND days = %s AND time = %s
        """, (grade, gender, days, time))
        result = cur.fetchone()
        cur.close()

        return jsonify({"count": result[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_name', methods=['POST'])
def check_name():
    try:
        data = request.get_json()
        name = data.get('name')
        guardian_phone = data.get('guardianPhone')

        if not name or not guardian_phone:
            return jsonify({"exists": False})

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM students 
            WHERE name = %s AND guardian_phone = %s
        """, (name, guardian_phone))
        count = cur.fetchone()[0]
        cur.close()

        return jsonify({"exists": count > 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=8080)
