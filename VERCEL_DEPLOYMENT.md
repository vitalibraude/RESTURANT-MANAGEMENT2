# SmartRest - Vercel Deployment Guide

## הוראות דיפלוי ל-Vercel

### שלב 1: הכנת הפרויקט
```bash
npm install
npm run build
```

### שלב 2: דיפלוי באמצעות Vercel CLI

1. התקן את Vercel CLI:
```bash
npm install -g vercel
```

2. התחבר ל-Vercel:
```bash
vercel login
```

3. הרץ את הפקודה לדיפלוי:
```bash
vercel
```

או לדיפלוי ישיר לפרודקשן:
```bash
vercel --prod
```

### שלב 3: דיפלוי דרך ממשק Vercel

1. היכנס ל-https://vercel.com
2. לחץ על "Add New Project"
3. Import את הריפוזיטורי מ-GitHub
4. Vercel יזהה אוטומטית את הגדרות Vite
5. לחץ Deploy

### הגדרות אוטומטיות

הפרויקט כולל קובץ `vercel.json` עם ההגדרות:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite
- SPA Routing: מוגדר

### פרטי התחברות למערכת

- **שם משתמש:** ויטלי
- **סיסמה:** 1234

### תכונות המערכת

- ✅ מסך התחברות
- ✅ ניהול מסעדה מלא
- ✅ הגדרות API
- ✅ ניהול מצלמות
- ✅ תמיכה ב-RTL (עברית)

### הערות חשובות

1. הפרויקט משתמש ב-Vite לבנייה מהירה
2. כל ההגדרות נשמרות ב-LocalStorage
3. התמיכה ב-Supabase מוכנה מראש

---

© 2026 SmartRest - STEADY
