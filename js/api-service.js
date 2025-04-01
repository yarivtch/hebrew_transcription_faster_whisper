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
    async transcribeAudio() {
        if (!this.currentFile) return;
    
        try {
            // וודא שה-loader מוצג
            this.showLoader('מתבצע תמלול...');
            
            const sensitivity = parseInt(this.sensitivitySlider.value);
            this.transcriptionResult = await apiService.transcribeAudio(this.currentFile, sensitivity);
            
            // הצגת הודעת התמלול
            this.transcriptionMessage.hidden = false;
            this.displayTranscription(this.transcriptionResult);
            this.saveTranscriptionBtn.hidden = false;
        } catch (error) {
            this.showError(error.message);
        } finally {
            // וודא שה-loader מוסתר
            this.hideLoader();
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