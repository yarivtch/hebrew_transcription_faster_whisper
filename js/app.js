import { currentConfig } from './config.js';
import apiService from './api-service.js';
import audioController from './audio-controller.js';
import waveformVisualizer from './waveform-visualizer.js';

// הסתרת ה-loader מיד בטעינה
document.getElementById('loader').hidden = true;

// וידוא שה-container מוצג
document.querySelector('.container').style.opacity = '1';

const app = new class App {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.audioInput = document.getElementById('audioInput');
        this.sensitivitySlider = document.getElementById('sensitivitySlider');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.transcriptionText = document.getElementById('transcriptionText');
        this.saveTranscriptionBtn = document.getElementById('saveTranscriptionBtn');
        this.loader = document.getElementById('loader');

        this.currentFile = null;
        this.transcriptionResult = null;

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
    }

    /**
     * טיפול בקובץ אודיו חדש
     * @param {File} file - קובץ האודיו שנבחר
     */
    async handleAudioFile(file) {
        try {
            this.currentFile = file;
            this.loader.hidden = true;
            await audioController.loadAudio(file);
            await waveformVisualizer.processAudio(audioController.audioBuffer);
            this.transcribeAudio();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * שליחת האודיו לתמלול
     */
    async transcribeAudio() {
        if (!this.currentFile) return;

        try {
            this.loader.hidden = false;
            const sensitivity = parseInt(this.sensitivitySlider.value);
            this.transcriptionResult = await apiService.transcribeAudio(this.currentFile, sensitivity);
            this.displayTranscription(this.transcriptionResult);
            this.saveTranscriptionBtn.hidden = false;
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.loader.hidden = true;
        }
    }

    /**
     * הצגת התמלול בממשק
     * @param {Object} result - תוצאות התמלול
     */
    displayTranscription(result) {
        if (!result || !result.text) {
            this.transcriptionText.innerHTML = '<p>לא נמצא תמלול</p>';
            return;
        }

        this.transcriptionText.innerHTML = result.text
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('');
    }

    /**
     * שמירת התמלול לקובץ טקסט
     */
    saveTranscription() {
        if (!this.transcriptionResult) return;

        const blob = new Blob([this.transcriptionResult.text], { type: 'text/plain' });
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