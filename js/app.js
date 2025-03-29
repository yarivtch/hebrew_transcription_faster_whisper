import { currentConfig } from './config.js';
import apiService from './api-service.js';
import audioController from './audio-controller.js';
import waveformVisualizer from './waveform-visualizer.js';

// הסתרת ה-loader מיד בטעינה
document.getElementById('loader').hidden = true;

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
            this.loader.hidden = false;
            this.loader.style.display = 'flex';
            
            await audioController.loadAudio(file);
            await waveformVisualizer.processAudio(audioController.audioBuffer);
            
            // הסתרת הלודר
            this.loader.hidden = true;
            this.loader.style.display = 'none';
            
            // הוספת שם הקובץ להיסטוריה
            this.addToHistory(file.name);
        } catch (error) {
            console.error("שגיאה בטיפול בקובץ אודיו:", error);
            this.showError(error.message);
            this.loader.hidden = true;
            this.loader.style.display = 'none';
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
    displayTranscription(result) {
        if (!result) {
            this.transcriptionText.innerHTML = '<p>לא נמצא תמלול</p>';
            return;
        }

        // בדיקה אם יש שדה full_text (כמו שהשרת שלך מחזיר) או text (כמו בדוגמה המקורית)
        const transcriptionText = result.full_text || result.text;
        
        if (!transcriptionText) {
            this.transcriptionText.innerHTML = '<p>לא נמצא תמלול</p>';
            return;
        }

        this.transcriptionText.innerHTML = transcriptionText
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('');
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
}(); 