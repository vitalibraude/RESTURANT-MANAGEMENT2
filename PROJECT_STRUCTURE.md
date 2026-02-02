# SmartRest - מבנה הפרויקט

## קבצים ראשיים
- `App.tsx` - רכיב ראשי, ניתוב בין דפים
- `index.tsx` - נקודת כניסה
- `types.ts` - טייפים גלובליים
- `vite.config.ts` - הגדרות Vite

## רכיבים (components/)
1. `Dashboard.tsx` - לוח בקרה ראשי
2. `Inventory.tsx` - ניהול מלאי + ביצוע הזמנות
3. `Orders.tsx` - הזמנות ומכירות
4. `Finance.tsx` - כספים וסליקה
5. `Messaging.tsx` - הודעות ללקוחות
6. `Suppliers.tsx` - ניהול ספקים ומוצרים
7. `SupplierOrders.tsx` - צפייה בהזמנות מספקים ⭐ חדש
8. `Sidebar.tsx` - תפריט ניווט
9. `AppGuide.tsx` - מדריך

## שירותים (services/)
1. `supabaseClient.ts` - חיבור ל-Supabase
2. `inventoryService.ts` - ניהול מלאי
3. `ordersService.ts` - הזמנות לקוחות + הזמנות מספקים ⭐ מעודכן
4. `suppliersService.ts` - ניהול ספקים
5. `financeService.ts` - כספים
6. `messagesService.ts` - הודעות
7. `geminiService.ts` - AI

## מסד נתונים (database/)
1. `schema.sql` - סכמה ראשית
2. `sample-data.sql` - נתונים לדוגמה
3. `suppliers-schema.sql` - סכמת ספקים
4. `suppliers-data-only.sql` - נתוני ספקים
5. `orders-schema.sql` - סכמת הזמנות מספקים ⭐ חדש

## תצוגות (Views) בתפריט
- `dashboard` - לוח בקרה
- `orders` - הזמנות ומכירות
- `inventory` - ניהול מלאי
- `suppliers` - ספקים
- `supplier-orders` - הזמנות מספקים ⭐ חדש
- `finance` - כספים וסליקה
- `messaging` - הודעות ללקוחות

## פיצ'רים עיקריים

### ניהול מלאי
- עקיבה אחר מלאי
- ספים מינימליים
- קישור לספקים
- **ביצוע הזמנות** - כפתור ירוק שיוצר הזמנות ב-DB

### ספקים
- ניהול ספקים
- מוצרים לכל ספק
- מחירים ויחידות
- ימי אספקה

### הזמנות מספקים (חדש!)
- מספר הזמנה אוטומטי
- פירוט פריטים
- מעקב עלויות
- תאריך אחרון להוספה
- סטטוס הזמנה

## Deploy Process
1. `npm run build` - בניית הפרויקט
2. `npm run deploy` - פרסום ל-GitHub Pages (gh-pages branch)

## Notes
- **חשוב**: אחרי כל שינוי בקוד, צריך לעשות:
  1. `git add .`
  2. `git commit -m "message"`
  3. `npm run build`
  4. `npm run deploy`
