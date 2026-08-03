# Stock Analyzer Pro

Fundamental & Technical analysis tool for US stocks. Single-page PWA. Educational use only — not financial advice.

## מבנה הקבצים (File structure)

```
/
├── index.html          ← האפליקציה עצמה (הקובץ שהעלית, שכבר עודכן)
├── manifest.json        ← PWA manifest
├── sw.js                 ← Service Worker חיצוני
├── .nojekyll              ← מונע מ-GitHub Pages להריץ עיבוד Jekyll
├── README.md              ← הקובץ הזה
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    ├── icon-512.png
    ├── icon-maskable-192.png   ← עם safe-zone (ראה למטה)
    └── icon-maskable-512.png
```

**חשוב:** את קבצי ה-icons אתה צריך להכניס בעצמך לתיקיית `icons/` לפי השמות המדויקים לעיל — הם מוזכרים ב-`manifest.json`. אם השמות אצלך שונים, עדכן את `manifest.json` בהתאם.

### דרישות לאייקונים (ל-Google Play בעתיד)
- **גדלים חובה מבחינת PWA/TWA**: לפחות 192×192 ו-512×512, PNG, רקע לא שקוף (Play Store דוחה שקיפות ב-icon הראשי).
- **Maskable icons**: התוכן המשמעותי (הלוגו) חייב להיות בתוך 80% המרכזיים של התמונה ("safe zone"), כי Android עלול לחתוך/לעגל את הקצוות. אם אין לך גרסת maskable נפרדת, אפשר להתחיל עם אותה תמונה אבל מומלץ מאוד גרסה ייעודית.

## מה עודכן ב-index.html

הקובץ המקורי השתמש ב:
1. `manifest` מוטמע כ-data URI בתוך ה-HTML (ללא אייקונים בכלל).
2. Service Worker שנרשם דרך Blob URL בזמן ריצה.

שני הפתרונות עבדו כ-PWA בסיסי, אבל **לא תואמים לדרישות TWA (Trusted Web Activity)** של Google Play — Chrome דורש קובץ `manifest.json` אמיתי בנתיב קבוע וקובץ Service Worker אמיתי (לא Blob) כדי לאשר "installability".

השינויים שבוצעו (רק שני מקומות, שום דבר אחר בקוד לא נגע):
- שורה 9: `<link rel="manifest">` מצביע עכשיו ל-`manifest.json` החיצוני, ונוספו תגי icon/apple-touch-icon.
- השורות שהכילו את רישום ה-Service Worker דרך Blob הוחלפו ברישום רגיל של `sw.js` חיצוני.

הלוגיקה העסקית, הניקוד, ה-API fallback chain וכל שאר האפליקציה **לא נגעו בהם**.

## פריסה ל-GitHub Pages (שלב 1 — עכשיו)

1. צור repo חדש ב-GitHub (public).
2. העלה את כל הקבצים מהתיקייה הזו לשורש ה-repo (כולל תיקיית `icons/` עם התמונות שלך).
3. ב-Settings → Pages → Source, בחר את ה-branch הראשי (`main`) ותיקיית root.
4. האתר יהיה זמין בכתובת: `https://<username>.github.io/<repo-name>/`
5. בדוק שהאפליקציה עולה, שה-manifest נטען (DevTools → Application → Manifest), ושה-SW נרשם (Application → Service Workers).

### בדיקת PWA תקינה
פתח את האתר בכתובת ה-HTTPS הסופית, ואז ב-Chrome DevTools → Lighthouse → הרץ בדיקת PWA. ודא שאין שגיאות ב-manifest או ב-service worker לפני שממשיכים לשלב הבא.

## מסלול ל-Google Play (שלב 2 — בעתיד)

Google Play לא מקבל PWA ישירות — צריך לעטוף אותו ב-**TWA (Trusted Web Activity)**, שהוא APK דק שפותח את ה-PWA שלך במסך מלא בלי UI של דפדפן. שני כלים מקובלים:

1. **Bubblewrap** (CLI רשמי של גוגל) — `npm install -g @bubblewrap/cli`, ואז `bubblewrap init --manifest=https://<your-domain>/manifest.json`.
2. **PWABuilder** (pwabuilder.com) — ממשק גרפי, מייצר את חבילת ה-Android אוטומטית מתוך כתובת ה-URL של ה-PWA שלך.

בשני המקרים תצטרך:
- **Digital Asset Links** — קובץ `assetlinks.json` שיושב ב-`/.well-known/assetlinks.json` בדומיין שלך (GitHub Pages תומך בזה), כדי ש-Android יאמת שאתה הבעלים של גם ה-APK וגם האתר. הכלים (Bubblewrap/PWABuilder) מייצרים את התוכן המדויק בשבילך אחרי שאתה חותם את ה-APK — אז זה שלב שמגיע *אחרי* חתימת האפליקציה, לא לפני.
- חשבון **Google Play Console** (תשלום חד-פעמי של $25).
- מדיניות פרטיות (privacy policy URL) — חובה אם האפליקציה שומרת/משתמשת בנתוני משתמש (למשל מפתחות API שהמשתמש מזין).

**חשוב לגבי `content://` / localStorage שתיעדת בעבר:** ה-WebView הפנימי של TWA (מבוסס Chrome האמיתי במכשיר) שונה מ-WebView מותאם כמו AppMint — הבעיה של multiple storage origins שראית שם ספציפית לאופן שבו AppMint עוטף WebView, וסביר שלא תחזור ב-TWA, אבל זה שווה בדיקה עם export/import ה-JSON הקיים כרשת ביטחון.

## מגבלות ידועות שהועברו מהפרויקט הקודם (Stock Scanner Pro)
- אם בעתיד תוסיף פיצ'ר של ייבוא קבצים (file picker) בתוך wrapper של WebView מותאם (כמו AppMint), ודא שה-callback `onShowFileChooser` מיושם — זו הייתה הבעיה התיעודית שם. ב-TWA אמיתי (Bubblewrap) הבעיה הזו לא אמורה להתקיים כי הוא רץ על Chrome עצמו.
