class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.defaultLanguage = 'mr-IN'; // Marathi as default
    this.defaultVoice = null;
    this.speaking = false;
    
    // Initialize voices when available
    if (this.synthesis) {
      this.initializeVoices();
      // Listen for voice changes
      this.synthesis.addEventListener('voiceschanged', () => {
        this.initializeVoices();
      });
    }
  }

  initializeVoices() {
    const voices = this.synthesis.getVoices();
    
    // Enhanced Marathi voice detection
    this.defaultVoice = voices.find(voice => 
      voice.lang === 'mr-IN' || 
      voice.lang === 'mr' ||
      voice.lang.startsWith('mr') ||
      voice.name.toLowerCase().includes('marathi') ||
      voice.name.toLowerCase().includes('marathi')
    ) || voices.find(voice => 
      voice.lang.includes('mr')
    ) || voices.find(voice => 
      voice.lang.includes('hi') // Fallback to Hindi if Marathi not available
    ) || voices.find(voice => 
      voice.lang.includes('en') // Fallback to English if Hindi not available
    ) || voices[0]; // Final fallback to first available voice
    
    // Log selected voice for debugging
    if (this.defaultVoice) {
      console.log('Selected voice:', {
        name: this.defaultVoice.name,
        lang: this.defaultVoice.lang,
        isMarathi: this.defaultVoice.lang.startsWith('mr') || this.defaultVoice.lang.includes('mr')
      });
    }
  }

  speak(text, options = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported in this browser');
      return false;
    }

    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided to speech service');
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language (default to Marathi)
    utterance.lang = options.language || this.defaultLanguage;
    
    // Set voice
    utterance.voice = options.voice || this.defaultVoice;
    
    // Set speech parameters
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Event handlers
    utterance.onstart = () => {
      this.speaking = true;
      if (options.onStart) options.onStart();
    };
    
    utterance.onend = () => {
      this.speaking = false;
      if (options.onEnd) options.onEnd();
    };
    
    utterance.onerror = (event) => {
      this.speaking = false;
      console.error('Speech synthesis error:', event);
      if (options.onError) options.onError(event);
    };

    // Start speaking
    this.synthesis.speak(utterance);
    return true;
  }

  stop() {
    if (this.synthesis && this.speaking) {
      this.synthesis.cancel();
      this.speaking = false;
    }
  }

  pause() {
    if (this.synthesis && this.speaking) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  isSpeaking() {
    return this.speaking;
  }

  getAvailableVoices() {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getSupportedLanguages() {
    const voices = this.getAvailableVoices();
    const languages = [...new Set(voices.map(voice => voice.lang))];
    return languages.sort();
  }

  setLanguage(language) {
    this.defaultLanguage = language;
    this.initializeVoices(); // Reinitialize to find best voice for new language
  }

  // Method to ensure Marathi voice is prioritized
  ensureMarathiVoice() {
    this.defaultLanguage = 'mr-IN';
    this.initializeVoices();
    return this.defaultVoice;
  }

  getLanguage() {
    return this.defaultLanguage;
  }

  // Convenience method for Marathi
  speakMarathi(text, options = {}) {
    return this.speak(text, { ...options, language: 'mr-IN' });
  }

  // Convenience method for English
  speakEnglish(text, options = {}) {
    return this.speak(text, { ...options, language: 'en-US' });
  }

  // Convenience method for Hindi
  speakHindi(text, options = {}) {
    return this.speak(text, { ...options, language: 'hi-IN' });
  }
}

// Create singleton instance
const speechService = new SpeechService();

export default speechService;

// Export utility functions
export const {
  speak,
  stop,
  pause,
  resume,
  isSpeaking,
  getAvailableVoices,
  getSupportedLanguages,
  setLanguage,
  getLanguage,
  speakMarathi,
  speakEnglish,
  speakHindi,
  ensureMarathiVoice
} = speechService;
