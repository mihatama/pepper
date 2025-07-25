// Speech Recognition Module
class SpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isSupported = this.checkSupport();
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.onResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
        
        if (this.isSupported) {
            this.initRecognition();
        }
    }

    checkSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStart) this.onStart();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (this.onResult) {
                this.onResult({
                    final: finalTranscript,
                    interim: interimTranscript,
                    isFinal: finalTranscript.length > 0
                });
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            const errorMessage = this.getErrorMessage(event.error);
            if (this.onError) this.onError(errorMessage);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };
    }

    getErrorMessage(error) {
        const errorMessages = {
            'no-speech': window.i18n ? window.i18n.t('errors.noSpeech') : 'No speech detected',
            'audio-capture': window.i18n ? window.i18n.t('errors.microphoneAccess') : 'Microphone access denied',
            'not-allowed': window.i18n ? window.i18n.t('errors.microphoneAccess') : 'Microphone access denied',
            'network': window.i18n ? window.i18n.t('errors.networkError') : 'Network error',
            'service-not-allowed': window.i18n ? window.i18n.t('errors.apiError') : 'Speech service not allowed'
        };

        return errorMessages[error] || `Speech recognition error: ${error}`;
    }

    setLanguage(language) {
        this.currentLanguage = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    start() {
        if (!this.isSupported) {
            const error = window.i18n ? window.i18n.t('errors.voiceNotSupported') : 
                         'Voice recognition is not supported in this browser';
            if (this.onError) this.onError(error);
            return false;
        }

        if (this.isListening) {
            this.stop();
            return false;
        }

        try {
            // Update language based on current i18n setting
            if (window.i18n) {
                this.setLanguage(window.i18n.getSpeechLang());
            }
            
            this.recognition.start();
            return true;
        } catch (error) {
            if (this.onError) this.onError(error.message);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    abort() {
        if (this.recognition && this.isListening) {
            this.recognition.abort();
        }
    }

    // Set event handlers
    setOnResult(callback) {
        this.onResult = callback;
    }

    setOnError(callback) {
        this.onError = callback;
    }

    setOnStart(callback) {
        this.onStart = callback;
    }

    setOnEnd(callback) {
        this.onEnd = callback;
    }
}

// Speech Synthesis Module
class SpeechSynthesis {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.currentLanguage = 'en-US';
        
        if (this.isSupported) {
            this.loadVoices();
            // Voices might load asynchronously
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
    }

    speak(text, options = {}) {
        if (!this.isSupported || !text) return false;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language
        utterance.lang = options.lang || this.currentLanguage;
        
        // Find appropriate voice
        const voice = this.findVoice(utterance.lang);
        if (voice) {
            utterance.voice = voice;
        }

        // Set other options
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // Event handlers
        if (options.onStart) utterance.onstart = options.onStart;
        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) utterance.onerror = options.onError;

        this.synth.speak(utterance);
        return true;
    }

    findVoice(lang) {
        // Try to find exact match first
        let voice = this.voices.find(v => v.lang === lang);
        
        // If not found, try language code only (e.g., 'en' from 'en-US')
        if (!voice) {
            const langCode = lang.split('-')[0];
            voice = this.voices.find(v => v.lang.startsWith(langCode));
        }

        return voice;
    }

    setLanguage(language) {
        this.currentLanguage = language;
    }

    stop() {
        if (this.isSupported) {
            this.synth.cancel();
        }
    }

    getVoices() {
        return this.voices;
    }
}

// Voice Interface Manager
class VoiceInterface {
    constructor() {
        this.speechRecognition = new SpeechRecognition();
        this.speechSynthesis = new SpeechSynthesis();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Update language when i18n language changes
        window.addEventListener('languageChanged', (event) => {
            const lang = event.detail.language === 'ja' ? 'ja-JP' : 'en-US';
            this.speechRecognition.setLanguage(lang);
            this.speechSynthesis.setLanguage(lang);
        });
    }

    // Start voice recognition for specific input
    startRecognition(inputElement, options = {}) {
        const button = options.button;
        const originalText = button ? button.innerHTML : '';

        this.speechRecognition.setOnStart(() => {
            if (button) {
                button.classList.add('recording');
                button.innerHTML = `🎤 <span>${window.i18n ? window.i18n.t('voice.listening') : 'Listening...'}</span>`;
            }
        });

        this.speechRecognition.setOnResult((result) => {
            if (inputElement) {
                inputElement.value = result.final || result.interim;
                // Trigger input event for any listeners
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        this.speechRecognition.setOnEnd(() => {
            if (button) {
                button.classList.remove('recording');
                button.innerHTML = originalText;
            }
            if (options.onEnd) options.onEnd();
        });

        this.speechRecognition.setOnError((error) => {
            if (button) {
                button.classList.remove('recording');
                button.innerHTML = originalText;
            }
            this.showError(error);
            if (options.onError) options.onError(error);
        });

        return this.speechRecognition.start();
    }

    // Stop current recognition
    stopRecognition() {
        this.speechRecognition.stop();
    }

    // Speak text
    speak(text, options = {}) {
        return this.speechSynthesis.speak(text, options);
    }

    // Stop speaking
    stopSpeaking() {
        this.speechSynthesis.stop();
    }

    // Show error message
    showError(message) {
        // Create temporary error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'voice-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Check if voice features are supported
    isRecognitionSupported() {
        return this.speechRecognition.isSupported;
    }

    isSynthesisSupported() {
        return this.speechSynthesis.isSupported;
    }
}

// Initialize voice interface
const voiceInterface = new VoiceInterface();

// Export for global use
window.SpeechRecognition = SpeechRecognition;
window.SpeechSynthesis = SpeechSynthesis;
window.VoiceInterface = VoiceInterface;
window.voiceInterface = voiceInterface;

// Setup voice buttons when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Voice button for taste input
    const voiceBtn = document.getElementById('voiceBtn');
    const tasteInput = document.getElementById('tasteInput');
    
    if (voiceBtn && tasteInput) {
        voiceBtn.addEventListener('click', () => {
            voiceInterface.startRecognition(tasteInput, { button: voiceBtn });
        });
    }

    // Voice button for dish input
    const dishVoiceBtn = document.getElementById('dishVoiceBtn');
    const dishInput = document.getElementById('dishInput');
    
    if (dishVoiceBtn && dishInput) {
        dishVoiceBtn.addEventListener('click', () => {
            voiceInterface.startRecognition(dishInput, { button: dishVoiceBtn });
        });
    }
});
