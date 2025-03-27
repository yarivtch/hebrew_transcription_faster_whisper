# מערכת תמלול אודיו - צד לקוח

מערכת לתמלול קבצי אודיו עם ממשק משתמש בעברית.

## תכונות

- העלאת קבצי אודיו בגרירה או בחירה
- ויזואליזציה של גלי הקול
- נגן אודיו מובנה עם שליטה מלאה
- כיוון רגישות זיהוי דוברים
- תמלול אוטומטי (דורש חיבור לשרת)
- שמירת התמלול לקובץ טקסט

## התקנה והרצה

1. הורד את הקוד מהמאגר: 
git clone https://github.com/username/hebrew_transcription_faster_whisper.git
cd hebrew_transcription_faster_whisper

2. הרץ שרת מקומי פשוט לפיתוח:
python server.py

3. פתח את הדפדפן בכתובת:
http://localhost:3000

## מבנה הפרויקט

- `index.html` - דף ה-HTML הראשי
- `css/styles.css` - קובץ העיצוב
- `js/` - תיקיית קבצי JavaScript:
  - `app.js` - הקוד הראשי של האפליקציה
  - `audio-controller.js` - ניהול השמעת האודיו
  - `waveform-visualizer.js` - ויזואליזציה של גלי הקול
  - `api-service.js` - תקשורת עם השרת
  - `config.js` - הגדרות האפליקציה
- `server.py` - שרת פיתוח פשוט

## טכנולוגיות

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- Canvas API

## פיתוח עתידי

- חיבור לשרת תמלול אמיתי
- זיהוי דוברים שונים
- עריכת התמלול
- ייצוא לפורמטים נוספים

## רישיון

MIT