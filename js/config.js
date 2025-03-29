const config = {
    development: {
        apiUrl: 'http://localhost:8000/transcribe',
    },
    production: {
        apiUrl: 'https://hebrew-transcription-f-w-service.onrender.com/transcribe',
    }
};

const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
const currentConfig = config[environment];

export { currentConfig }; 