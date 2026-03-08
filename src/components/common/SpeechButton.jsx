import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import useSpeech from '../../hooks/useSpeech';
import toast from 'react-hot-toast';

const SpeechButton = ({ 
  text, 
  children, 
  className = '', 
  language = 'mr-IN',
  showControls = false,
  autoPlay = false,
  onSpeechStart,
  onSpeechEnd,
  onError 
}) => {
  const { 
    isSpeaking, 
    isSupported, 
    speak, 
    stop, 
    pause, 
    resume, 
    setLanguage,
    speakMarathi,
    speakEnglish,
    speakHindi 
  } = useSpeech();

  const [isPaused, setIsPaused] = useState(false);

  const handleSpeak = () => {
    if (!isSupported) {
      toast.error('Speech synthesis is not supported in your browser');
      return;
    }

    if (!text || text.trim() === '') {
      toast.error('No text to speak');
      return;
    }

    if (isSpeaking && !isPaused) {
      // Pause if currently speaking
      pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      // Resume if paused
      resume();
      setIsPaused(false);
    } else {
      // Start speaking
      setIsPaused(false);
      setLanguage(language);
      
      const success = speak(text, {
        language,
        onStart: () => {
          if (onSpeechStart) onSpeechStart();
        },
        onEnd: () => {
          setIsPaused(false);
          if (onSpeechEnd) onSpeechEnd();
        },
        onError: (error) => {
          setIsPaused(false);
          toast.error('Speech synthesis failed');
          if (onError) onError(error);
        }
      });
      
      if (!success) {
        toast.error('Failed to start speech synthesis');
      }
    }
  };

  const handleStop = () => {
    stop();
    setIsPaused(false);
  };

  const getConvenienceMethod = () => {
    switch (language) {
      case 'mr-IN':
        return speakMarathi;
      case 'en-US':
        return speakEnglish;
      case 'hi-IN':
        return speakHindi;
      default:
        return speak;
    }
  };

  const handleQuickSpeak = () => {
    const method = getConvenienceMethod();
    method(text, {
      onSpeechStart,
      onSpeechEnd,
      onError
    });
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && text && isSupported) {
      handleQuickSpeak();
    }
  }, [autoPlay, text, isSupported]);

  if (!isSupported) {
    return (
      <div className={`text-gray-400 cursor-not-allowed ${className}`}>
        <VolumeX size={20} />
        {children}
      </div>
    );
  }

  if (showControls) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleSpeak}
          className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Speak'}
        >
          {isSpeaking ? (isPaused ? <Play size={16} /> : <Pause size={16} />) : <Volume2 size={16} />}
        </button>
        
        {isSpeaking && (
          <button
            onClick={handleStop}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="Stop"
          >
            <Square size={16} />
          </button>
        )}
        
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={!text || text.trim() === ''}
      title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Speak in Marathi'}
    >
      {isSpeaking ? (isPaused ? <Play size={16} /> : <Pause size={16} />) : <Volume2 size={16} />}
      {children}
    </button>
  );
};

export default SpeechButton;
