import { useState, useEffect, useCallback } from 'react';
import speechService from '../services/speechService';

export const useSpeech = (defaultOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('mr-IN');

  useEffect(() => {
    // Check if speech synthesis is supported
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      // Get available voices
      const voices = speechService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Set initial language
      setCurrentLanguage(speechService.getLanguage());
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };
    
    const success = speechService.speak(text, {
      ...mergedOptions,
      onStart: () => {
        setIsSpeaking(true);
        if (mergedOptions.onStart) mergedOptions.onStart();
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (mergedOptions.onEnd) mergedOptions.onEnd();
      },
      onError: (error) => {
        setIsSpeaking(false);
        if (mergedOptions.onError) mergedOptions.onError(error);
      }
    });
    
    return success;
  }, [defaultOptions]);

  const stop = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
  }, []);

  const setLanguage = useCallback((language) => {
    speechService.setLanguage(language);
    setCurrentLanguage(language);
  }, []);

  // Convenience methods
  const speakMarathi = useCallback((text, options = {}) => {
    return speak(text, { ...options, language: 'mr-IN' });
  }, [speak]);

  const speakEnglish = useCallback((text, options = {}) => {
    return speak(text, { ...options, language: 'en-US' });
  }, [speak]);

  const speakHindi = useCallback((text, options = {}) => {
    return speak(text, { ...options, language: 'hi-IN' });
  }, [speak]);

  return {
    // State
    isSpeaking,
    isSupported,
    availableVoices,
    currentLanguage,
    
    // Methods
    speak,
    stop,
    pause,
    resume,
    setLanguage,
    
    // Convenience methods
    speakMarathi,
    speakEnglish,
    speakHindi
  };
};

export default useSpeech;
