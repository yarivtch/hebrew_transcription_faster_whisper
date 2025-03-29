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
        try {
            const formData = new FormData();
            formData.append('file', audioFile);  // שים לב: השם 'file' צריך להתאים למה שהשרת מצפה לקבל
            formData.append('sensitivity', sensitivity);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData,
                // אם השרת דורש אימות, אפשר להוסיף headers
                // headers: {
                //     'Authorization': 'Bearer YOUR_TOKEN'
                // }
            });

            if (!response.ok) {
                throw new Error(`שגיאת שרת: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('שגיאה בתמלול:', error);
            throw new Error('אירעה שגיאה בתהליך התמלול. אנא נסה שנית.');
        }
    }

    /**
     * בדיקת זמינות השרת
     * @returns {Promise<boolean>}
     */
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/status`, {
                method: 'GET',
            });
            return response.ok;
        } catch (error) {
            console.error('שגיאה בבדיקת סטטוס השרת:', error);
            return false;
        }
    }
}

export default new ApiService(); 