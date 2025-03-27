class WaveformVisualizer {
    constructor() {
        this.canvas = document.getElementById('waveform');
        this.ctx = this.canvas.getContext('2d');
        this.audioData = null;
        this.isRendering = false;

        // הגדרת גודל הקנבס
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * התאמת גודל הקנבס לגודל המסך
     */
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        if (this.audioData) {
            this.drawWaveform();
        }
    }

    /**
     * עיבוד נתוני האודיו ליצירת הויזואליזציה
     * @param {AudioBuffer} audioBuffer - באפר האודיו לעיבוד
     */
    async processAudio(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const samplesPerPixel = Math.floor(channelData.length / this.canvas.width);
        this.audioData = [];

        // חישוב ממוצעי אמפליטודות לכל פיקסל
        for (let i = 0; i < this.canvas.width; i++) {
            const startSample = i * samplesPerPixel;
            const endSample = startSample + samplesPerPixel;
            let sum = 0;

            for (let j = startSample; j < endSample; j++) {
                sum += Math.abs(channelData[j]);
            }

            this.audioData.push(sum / samplesPerPixel);
        }

        // נירמול הנתונים
        const maxAmplitude = Math.max(...this.audioData);
        this.audioData = this.audioData.map(amp => amp / maxAmplitude);

        this.drawWaveform();
    }

    /**
     * ציור צורת הגל על הקנבס
     */
    drawWaveform() {
        if (!this.audioData || this.isRendering) return;

        this.isRendering = true;
        const { width, height } = this.canvas;
        const centerY = height / 2;

        // ניקוי הקנבס
        this.ctx.clearRect(0, 0, width, height);

        // הגדרות סגנון
        this.ctx.strokeStyle = '#4a90e2';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        // ציור הגל
        this.audioData.forEach((amplitude, index) => {
            const x = index;
            const y = centerY + (amplitude * centerY * 0.95);
            const y2 = centerY - (amplitude * centerY * 0.95);

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        // ציור הגל המשקף
        this.audioData.reverse().forEach((amplitude, index) => {
            const x = width - index - 1;
            const y = centerY - (amplitude * centerY * 0.95);
            this.ctx.lineTo(x, y);
        });

        this.ctx.stroke();
        this.ctx.closePath();
        this.isRendering = false;
    }

    /**
     * עדכון מיקום המשחק הנוכחי
     * @param {number} progress - אחוז ההתקדמות (0-100)
     */
    updatePlaybackPosition(progress) {
        if (!this.audioData) return;

        this.drawWaveform();
        
        // ציור קו ההתקדמות
        const x = (progress / 100) * this.canvas.width;
        this.ctx.strokeStyle = '#27ae60';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }
}

export default new WaveformVisualizer(); 