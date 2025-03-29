class AudioController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.audioSource = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        
        // אלמנטים מה-DOM
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        
        // הוספת מאזינים לאירועים
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.setupProgressBarEvents();
    }

    /**
     * טעינת קובץ אודיו חדש
     * @param {File} audioFile - קובץ האודיו לטעינה
     * @returns {Promise<void>}
     */
    async loadAudio(audioFile) {
        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.resetPlayback();
            
            // עדכון לממשק החדש - אין צורך להסתיר/להציג אלמנטים כאן
            // document.querySelector('.audio-controls').hidden = false;
        } catch (error) {
            console.error('שגיאה בטעינת האודיו:', error);
            throw new Error('לא ניתן לטעון את קובץ האודיו');
        }
    }

    /**
     * הפעלה או השהייה של האודיו
     */
    togglePlayPause() {
        if (!this.audioBuffer) return;

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * הפעלת האודיו
     */
    play() {
        if (this.audioSource) {
            this.audioSource.disconnect();
        }

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.connect(this.audioContext.destination);
        
        const offset = this.pauseTime;
        this.audioSource.start(0, offset);
        
        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime - offset;
        
        // עדכון לממשק החדש - שימוש באייקון
        const playIcon = this.playPauseBtn.querySelector('i');
        if (playIcon) {
            playIcon.className = 'fas fa-pause';
        } else {
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.startProgressUpdate();
        
        this.audioSource.onended = () => {
            if (this.isPlaying) {
                this.resetPlayback();
            }
        };
    }

    /**
     * השהיית האודיו
     */
    pause() {
        if (!this.isPlaying || !this.audioSource) return;
        
        this.audioSource.disconnect();
        this.audioSource = null;
        this.isPlaying = false;
        
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        
        // עדכון לממשק החדש - שימוש באייקון
        const playIcon = this.playPauseBtn.querySelector('i');
        if (playIcon) {
            playIcon.className = 'fas fa-play';
        } else {
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        this.stopProgressUpdate();
    }

    /**
     * איפוס מצב הניגון
     */
    resetPlayback() {
        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        this.isPlaying = false;
        this.pauseTime = 0;
        
        // עדכון לממשק החדש - שימוש באייקון
        const playIcon = this.playPauseBtn.querySelector('i');
        if (playIcon) {
            playIcon.className = 'fas fa-play';
        } else {
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        this.updateProgressBar(0);
        this.stopProgressUpdate();
    }

    /**
     * הגדרת מאזינים לאירועים של סרגל ההתקדמות
     */
    setupProgressBarEvents() {
        const progressContainer = this.progressBar.parentElement;
        
        progressContainer.addEventListener('click', (e) => {
            if (!this.audioBuffer) return;
            
            const rect = progressContainer.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const percentage = (clickPosition / rect.width) * 100;
            const time = (percentage / 100) * this.audioBuffer.duration;
            
            this.seekTo(time);
        });
    }

    /**
     * קפיצה לנקודת זמן מסוימת
     * @param {number} time - הזמן בשניות
     */
    seekTo(time) {
        if (!this.audioBuffer) return;

        this.pauseTime = Math.min(Math.max(time, 0), this.audioBuffer.duration);
        
        if (this.isPlaying) {
            this.play();
        } else {
            this.updateProgressBar(this.pauseTime / this.audioBuffer.duration * 100);
        }
    }

    /**
     * התחלת עדכון סרגל ההתקדמות
     */
    startProgressUpdate() {
        this.progressUpdateInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            const currentTime = this.audioContext.currentTime - this.startTime;
            const progress = (currentTime / this.audioBuffer.duration) * 100;
            
            this.updateProgressBar(progress);
            
            if (currentTime >= this.audioBuffer.duration) {
                this.resetPlayback();
            }
        }, 100);
    }

    /**
     * עצירת עדכון סרגל ההתקדמות
     */
    stopProgressUpdate() {
        clearInterval(this.progressUpdateInterval);
    }

    /**
     * עדכון סרגל ההתקדמות
     * @param {number} percentage - אחוז ההתקדמות
     */
    updateProgressBar(percentage) {
        this.progressBar.style.width = `${percentage}%`;
    }
}

export default new AudioController(); 