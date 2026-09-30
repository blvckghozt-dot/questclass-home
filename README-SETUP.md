# QuestClass Home — คู่มือตั้งค่า (ทำครั้งเดียว ~20 นาที)

## A. Firebase (โปรเจกต์ questclass-home ที่คุณสร้างไว้แล้ว)
1. เมนูซ้าย Build → **Firestore Database** → Create database → ตำแหน่ง **asia-southeast1 (Singapore)** → เลือก **Production mode** → Create
2. แท็บ **Rules** → ลบของเดิมทั้งหมด → วางเนื้อหาไฟล์ `firestore.rules` → กด **Publish**
3. เมนูซ้าย Build → **Authentication** → Get started → แท็บ Sign-in method → **Google** → Enable → ใส่อีเมลสนับสนุน (apiwatpawong@gmail.com) → Save

## B. GitHub Pages
1. สมัคร/ล็อกอิน github.com → New repository ชื่อ `questclass-home` → เลือก **Public** → Create
2. กด "uploading an existing file" → ลากไฟล์และโฟลเดอร์ **ทั้งหมดใน zip** (index.html, teacher.html, core.js, realart-core.js, firebase-config.js, firestore.rules, โฟลเดอร์ sprites) → Commit changes
   (ถ้าลากโฟลเดอร์ sprites ไม่ได้ ให้ลากไฟล์ .png ข้างในทีละชุดได้ ไม่เกิน 100 ไฟล์ต่อครั้ง)
3. Settings → Pages → Source: **Deploy from a branch** → Branch `main` / `/ (root)` → Save
4. รอ 1–2 นาที จะได้ลิงก์ `https://<ชื่อ-github>.github.io/questclass-home/`

## C. อนุญาตโดเมนให้ล็อกอิน Google
Firebase → Authentication → Settings → **Authorized domains** → Add domain → `<ชื่อ-github>.github.io`

## D. ทดสอบ
1. เปิด `.../teacher.html` → เข้าสู่ระบบด้วย Google (apiwatpawong@gmail.com)
2. กด "สร้างบ้านตัวอย่าง" → เปิดหน้านักเรียน ใส่รหัส `TEST-2345`
3. กด "เริ่มทดสอบ" ต้องขึ้น PASS ทุกข้อ → แล้วกด "ลบข้อมูลทดสอบ"
