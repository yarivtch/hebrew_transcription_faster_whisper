import { currentConfig } from './config.js';

// שירות לתקשורת עם ה-API
class ApiService {
    constructor() {
        this.apiUrl = currentConfig.apiUrl;
    }

    /**
     * שליחת קובץ אודיו לתמלול
     * @param {File} audioFile - קובץ האודיו לתמלול
     * @param {number} sensitivity - רגישות זיהוי הדוברים (0-100)
     * @returns {Promise<Object>} - תוצאות התמלול
     */
    async transcribeAudio(audioFile, sensitivity) {
        // לצורכי בדיקה בלבד
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    text: "זוהי דוגמה לתמלול.\nשורה שנייה לדוגמה.\nשורה שלישית."
                });
            }, 2000);
        });
    }

    /**
     * בדיקת זמינות השרת
     * @returns {Promise<boolean>}
     */
    async checkServerStatus() {
        // בזמן פיתוח נחזיר תמיד true
        return true;
    }
}

export default new ApiService(); 