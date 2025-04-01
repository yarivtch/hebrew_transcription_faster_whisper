document.addEventListener('DOMContentLoaded', function() {
    console.log("טוען אפליקציית תמלול מינימליסטית");
    
    // אתחול אלמנטים בסיסיים בלבד
    const dropZone = document.getElementById('dropZone');
    const audioInput = document.getElementById('audioInput');
    const loader = document.getElementById('loader');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const transcriptionContainer = document.getElementById('transcriptionContainer');
    const fileSelectionMessage = document.getElementById('fileSelectionMessage');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    // משתנה לשמירת הקובץ הנוכחי
    let currentFile = null;
    
    // הסתרת כפתור התמלול בהתחלה
    if (transcribeBtn) {
        transcribeBtn.style.display = 'none';
    }
    
    // טיפול בהעלאת קובץ
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            if (audioInput) {
                audioInput.click();
            }
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (e.dataTransfer.files.length) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (audioInput) {
        audioInput.addEventListener('change', () => {
            if (audioInput.files.length) {
                handleFileSelection(audioInput.files[0]);
            }
        });
    }
    
    // טיפול בבחירת קובץ - פונקציונליות מינימלית
    function handleFileSelection(file) {
        console.log("נבחר קובץ:", file.name);
        currentFile = file;
        
        // עדכון הודעה על הקובץ שנבחר
        if (fileNameDisplay) {
            fileNameDisplay.textContent = file.name;
        }
        
        if (fileSelectionMessage) {
            fileSelectionMessage.style.display = 'block';
        }
        
        // הצגת כפתור התמלול
        if (transcribeBtn) {
            transcribeBtn.style.display = 'block';
        }
    }
    
    // טיפול בכפתור תמלול - פונקציונליות מינימלית
    if (transcribeBtn) {
        transcribeBtn.addEventListener('click', () => {
            if (!currentFile) {
                alert('אנא העלה קובץ אודיו תחילה');
                return;
            }
            
            console.log("מתחיל תמלול");
            if (loader) {
                loader.style.display = 'flex';
            }
            
            // שליחת הקובץ לתמלול
            const formData = new FormData();
            formData.append('file', currentFile);
            
            fetch('http://localhost:8000/transcribe', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`שגיאת שרת: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("נתוני תשובה:", JSON.stringify(data, null, 2));
                if (loader) {
                    loader.style.display = 'none';
                }
                
                // הצגת התמלול בתיבת טקסט - פונקציונליות מינימלית
                if (transcriptionContainer) {
                    if (data.full_text) {
                        transcriptionContainer.innerHTML = `
                            <h3>תוצאות התמלול:</h3>
                            <textarea class="full-text-area" readonly>${data.full_text}</textarea>
                            <button id="saveBtn" class="action-btn">
                                <i class="fas fa-save"></i> שמור תמלול
                            </button>
                        `;
                        
                        // הוספת אירוע לכפתור השמירה
                        const saveBtn = document.getElementById('saveBtn');
                        if (saveBtn) {
                            saveBtn.addEventListener('click', () => {
                                saveTranscription(data.full_text);
                            });
                        }
                    } else {
                        transcriptionContainer.innerHTML = `
                            <div class="error-message">לא התקבל תמלול מהשרת</div>
                        `;
                    }
                }
            })
            .catch(error => {
                console.error("שגיאה בתקשורת עם השרת:", error);
                if (loader) {
                    loader.style.display = 'none';
                }
                
                if (transcriptionContainer) {
                    transcriptionContainer.innerHTML = `
                        <div class="error-message">אירעה שגיאה בתהליך התמלול: ${error.message}</div>
                    `;
                }
            });
        });
    }
    
    // פונקציה לשמירת התמלול - פונקציונליות בסיסית
    function saveTranscription(text) {
        if (!text) return;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcription.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});