import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

const TextToSpeech = ({ text, isLoading: pdfLoading = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef(null);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select default English voice
      const defaultVoice = availableVoices.find(v => v.lang === "en-US") || 
                           availableVoices.find(v => v.lang.includes("en")) || 
                           availableVoices[0];
      setSelectedVoice(defaultVoice);
    };

    // Load voices immediately if available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      // Wait for voices to be loaded
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (textToSpeak) => {
    if (!textToSpeak || !window.speechSynthesis) return;

    // Cancel any ongoing speech to prevent duplicates
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Set voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set speech parameters
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      console.log("Speech started");
      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
    };

    utterance.onend = () => {
      console.log("Speech finished");
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      utteranceRef.current = null;
    };

    // Start speaking (user interaction required)
    setIsLoading(true);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis && isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      utteranceRef.current = null;
    }
  };

  const handleVoiceChange = (e) => {
    const voice = voices.find(v => v.name === e.target.value);
    setSelectedVoice(voice);
  };

  if (!text) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-4">
        <Volume2 className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Text-to-Speech</h3>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2 mb-4">
        <button 
          onClick={() => speakText(text)}
          disabled={isLoading || pdfLoading || !selectedVoice}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || pdfLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isPlaying && !isPaused ? 'Speaking...' : '🔊 Speak'}
        </button>

        <button 
          onClick={pauseSpeaking}
          disabled={!isPlaying || isPaused}
          className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </button>

        <button 
          onClick={resumeSpeaking}
          disabled={!isPlaying || !isPaused}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 mr-2" />
          Resume
        </button>

        <button 
          onClick={stopSpeaking}
          disabled={!isPlaying}
          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square className="h-4 w-4 mr-2" />
          Stop
        </button>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice
          </label>
          <select
            value={selectedVoice?.name || ''}
            onChange={handleVoiceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speed: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 text-sm text-gray-600">
        {pdfLoading && (
          <span className="text-orange-600">📄 Extracting PDF text...</span>
        )}
        {isLoading && !pdfLoading && (
          <span className="text-blue-600">🔊 Loading speech...</span>
        )}
        {isPlaying && !isPaused && !pdfLoading && (
          <span className="text-green-600">🔊 Speaking...</span>
        )}
        {isPaused && (
          <span className="text-orange-600">⏸️ Paused</span>
        )}
        {!isPlaying && !isPaused && !isLoading && !pdfLoading && (
          <span className="text-gray-500">Ready to speak</span>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;
