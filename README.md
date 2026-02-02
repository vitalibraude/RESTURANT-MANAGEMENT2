# 🍽️ SmartRest - Restaurant Management System

**מערכת ניהול מסעדה חכמה**

מערכת ניהול מקיפה למסעדות המשלבת בינה מלאכותית לניהול מלאי, הזמנות, תקשורת והודעות.

---

**נבנה על ידי: ויטלי פבלובסקי**

## 🚀 התקנה והרצה

### דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- חשבון Supabase (חינמי)

### שלב 1: התקנת תלויות

```bash
npm install
```

### שלב 2: הגדרת Supabase

**קרא את ההוראות המפורטות ב-[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

בקצרה:
1. צור פרויקט ב-Supabase
2. העתק את ה-URL ו-API Key
3. עדכן את קובץ `.env.local`
4. הרץ את `database/schema.sql` ב-SQL Editor

### שלב 3: הרצת האפליקציה

```bash
npm run dev
```

פתח בדפדפן: `http://localhost:3001`

---

## ✨ תכונות עיקריות

### 📦 ניהול מלאי
- מעקב אחר כמויות בזמן אמת
- התראות על מלאי נמוך
- קישור לספקים
- 3 מצבי הזמנה: ידני, חצי-אוטומטי, אוטומטי מלא

### 📋 ניהול הזמנות
- מעקב אחר הזמנות בזמן אמת
- ניהול סטטוס הזמנות
- היסטוריית הזמנות

### 💰 ניהול פיננסי
- מעקב הכנסות והוצאות
- דוחות ורווח חודשי
- קטגוריזציה אוטומטית

### 💬 מערכת הודעות
- תקשורת בין צוות
- הודעות בזמן אמת
- סימון הודעות שנקראו

### 📊 דשבורד אנליטי
- סטטיסטיקות מכירות
- ניתוח ביצועים
- גרפים ותצוגות ויזואליות

---

## 🛠️ טכנולוגיות

- **Frontend**: React + TypeScript + Vite
- **UI**: TailwindCSS + Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **AI**: Google Gemini API

---

## 📁 מבנה הפרויקט

```
smartrest/
├── components/          # רכיבי React
│   ├── Inventory.tsx   # ניהול מלאי
│   ├── Orders.tsx      # הזמנות
│   ├── Finance.tsx     # פיננסים
│   └── ...
├── services/           # שירותי API
│   ├── supabaseClient.ts
│   ├── inventoryService.ts
│   ├── ordersService.ts
│   ├── financeService.ts
│   └── messagesService.ts
├── database/           # סכמת דאטאבייס
│   └── schema.sql
└── ...
```

---

## 🌐 GitHub Pages

האפליקציה תהיה זמינה בקרוב ב: https://vitalibraude.github.io/RESTURANT-MANAGEMENT/

---

## 📄 רישיון

**© 2026 ויטלי פבלובסקי - All Rights Reserved**
