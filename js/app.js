import { currentConfig } from './config.js';
import apiService from './api-service.js';
import audioController from './audio-controller.js';
import waveformVisualizer from './waveform-visualizer.js';

// הסתרת ה-loader מיד בטעינה
// הסתרת ה-loader מיד בטעינה
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.hidden = true;
        loader.style.display = 'none';
    }
});

// וידוא שהממשק מוצג (עדכון לממשק החדש)
document.querySelector('.app-container').style.opacity = '1';

const app = new class App {
    constructor() {
        // אלמנטים של ממשק המשתמש
        this.dropZone = document.getElementById('dropZone');
        this.audioInput = document.getElementById('audioInput');
        this.sensitivitySlider = document.getElementById('sensitivitySlider');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.transcriptionText = document.getElementById('transcriptionText');
        this.saveTranscriptionBtn = document.getElementById('saveTranscriptionBtn');
        this.transcribeBtn = document.getElementById('transcribeBtn');
        this.loader = document.getElementById('loader');
        this.newChatBtn = document.getElementById('newChatBtn');
        
        // אלמנטים של מסך הצ'אט
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.audioMessage = document.getElementById('audioMessage');
        this.transcriptionMessage = document.getElementById('transcriptionMessage');
        
        this.currentFile = null;
        this.transcriptionResult = null;
        this.transcriptionHistory = [];

        this.initializeEventListeners();
    }

    /**
     * אתחול מאזיני אירועים
     */
    initializeEventListeners() {
        // אירועי גרירת קבצים
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.handleAudioFile(file);
            }
        });

        // אירוע בחירת קובץ
        this.dropZone.addEventListener('click', () => this.audioInput.click());
        this.audioInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleAudioFile(file);
            }
        });

        // אירוע שינוי רגישות
        this.sensitivitySlider.addEventListener('input', () => {
            this.sensitivityValue.textContent = this.sensitivitySlider.value;
        });

        // אירוע שמירת תמלול
        this.saveTranscriptionBtn.addEventListener('click', () => this.saveTranscription());

        // אירוע לחיצה על כפתור תמלול
        this.transcribeBtn.addEventListener('click', () => this.transcribeAudio());
        
        // אירוע לחיצה על כפתור צ'אט חדש
        this.newChatBtn.addEventListener('click', () => this.resetChat());
        // תמיכה ברספונסיביות
        const menuToggle = document.getElementById('menuToggle');
        const closeSidebar = document.getElementById('closeSidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('open');
                overlay.classList.add('active');
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        // הוספת קלאס loaded לאפליקציה לאנימציית טעינה
        setTimeout(() => {
            document.querySelector('.app-container').classList.add('loaded');
        }, 100);
    }

        /**
     * הצגת מצב טעינה
     * @param {string} message - הודעת טעינה
     */
    showLoader(message = 'טוען...') {
        const loaderMessage = this.loader.querySelector('.loader-message');
        if (loaderMessage) {
            loaderMessage.textContent = message;
        }
        this.loader.hidden = false;
        this.loader.style.display = 'flex';
    }

    /**
     * הסתרת מצב טעינה
     */
    hideLoader() {
        this.loader.hidden = true;
        this.loader.style.display = 'none';
    }

    /**
     * טיפול בקובץ אודיו חדש
     * @param {File} file - קובץ האודיו שנבחר
     */
    
    async handleAudioFile(file) {
        try {
            console.log("מטפל בקובץ אודיו:", file.name);
            this.currentFile = file;
            
            // מעבר למצב צ'אט
            this.welcomeScreen.hidden = true;
            this.chatMessages.hidden = false;
            this.chatInput.hidden = false;
            this.audioMessage.hidden = false;
            
            // טעינת האודיו
            this.showLoader('טוען את קובץ האודיו...');
            
            await audioController.loadAudio(file);
            
            this.showLoader('מעבד את צורת הגל...');
            await waveformVisualizer.processAudio(audioController.audioBuffer);
            
            // הסתרת הלודר
            this.hideLoader();
            
            // הוספת שם הקובץ להיסטוריה
            this.addToHistory(file.name);
        } catch (error) {
            console.error("שגיאה בטיפול בקובץ אודיו:", error);
            this.showError(error.message);
            this.hideLoader();
        }
    }
    
    /**
     * הוספת תמלול להיסטוריה
     * @param {string} name - שם התמלול
     */
    addToHistory(name) {
        const historyList = document.getElementById('historyList');
        const listItem = document.createElement('li');
        listItem.textContent = name;
        historyList.appendChild(listItem);
        
        // שמירה במערך ההיסטוריה
        this.transcriptionHistory.push({
            name: name,
            date: new Date()
        });
    }
    
    /**
     * איפוס הצ'אט למצב התחלתי
     */
    resetChat() {
        this.welcomeScreen.hidden = false;
        this.chatMessages.hidden = true;
        this.chatInput.hidden = true;
        this.audioMessage.hidden = true;
        this.transcriptionMessage.hidden = true;
        this.saveTranscriptionBtn.hidden = true;
        
        this.currentFile = null;
        this.transcriptionResult = null;
        this.transcriptionText.innerHTML = '';
    }

    /**
     * שליחת האודיו לתמלול
     */
    async transcribeAudio() {
        if (!this.currentFile) return;

        try {
            // וודא שה-loader מוצג
            this.loader.hidden = false;
            this.loader.style.display = 'flex';
            
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
            this.loader.hidden = true;
            this.loader.style.display = 'none';
        }
    }

    /**
     * הצגת התמלול בממשק
     * @param {Object} result - תוצאות התמלול
     */
    /**
     * הצגת התמלול בממשק
     * @param {Object} result - תוצאות התמלול
     */
    displayTranscription(result) {
        if (!result) {
            this.transcriptionText.innerHTML = '<div class="empty-result">לא נמצא תמלול</div>';
            return;
        }

        // בדיקה אם יש שדה full_text או text
        const transcriptionText = result.full_text || result.text;
        
        if (!transcriptionText) {
            this.transcriptionText.innerHTML = '<div class="empty-result">לא נמצא תמלול</div>';
            return;
        }

        // בדיקה אם יש מידע על דוברים
        if (result.speakers && result.segments) {
            let html = '';
            
            // מיון הסגמנטים לפי זמן התחלה
            const sortedSegments = [...result.segments].sort((a, b) => a.start - b.start);
            
            sortedSegments.forEach(segment => {
                const speakerClass = `speaker-${segment.speaker}`;
                const timeFormatted = this.formatTime(segment.start);
                
                html += `
                    <div class="segment ${speakerClass}">
                        <div class="segment-header">
                            <span class="speaker-label">דובר ${segment.speaker}</span>
                            <span class="timestamp">${timeFormatted}</span>
                        </div>
                        <p class="segment-text">${segment.text}</p>
                    </div>
                `;
            });
            
            this.transcriptionText.innerHTML = html;
        } else {
            // תצוגה רגילה ללא דוברים
            this.transcriptionText.innerHTML = transcriptionText
                .split('\n')
                .map(line => `<p class="simple-text">${line}</p>`)
                .join('');
        }
    }


        /**
     * פורמט זמן משניות לתצוגה של MM:SS
     * @param {number} seconds - זמן בשניות
     * @returns {string} - זמן מפורמט
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }   
    /**
     * שמירת התמלול לקובץ טקסט
     */

    saveTranscription() {
        if (!this.transcriptionResult) return;

        // בדיקה אם יש שדה full_text או text
        const transcriptionText = this.transcriptionResult.full_text || this.transcriptionResult.text;
        
        if (!transcriptionText) return;

        const blob = new Blob([transcriptionText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcription.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * הצגת הודעת שגיאה
     * @param {string} message - הודעת השגיאה
     */
    showError(message) {
        alert(message);
    }

    /**
     * הוספת הודעה לצ'אט עם אנימציה
     * @param {string} content - תוכן ההודעה
     * @param {string} type - סוג ההודעה (system, user, audio, transcription)
     */
    addChatMessage(content, type = 'system') {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}-message`;
        messageElement.innerHTML = content;
        
        this.chatMessages.appendChild(messageElement);
        
        // הפעלת אנימציה
        setTimeout(() => messageElement.classList.add('show'), 10);
        
        // גלילה לתחתית הצ'אט
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}(); 