import React, {useState, useEffect, useRef} from 'react';
import {Mic, Loader2, Brain} from 'lucide-react';
import {transcribeWithWhisper} from '../utils/whisper';
import {useLogger} from '@kit/logger/react';

export function MicButton({onTranscript, className = ''}) {
  const logger = useLogger({ scope: 'MicButton' });
  const [state, setState] = useState('idle'); // idle, recording, transcribing, processing
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const lastTapRef = useRef(0);

  // Start recording
  const startRecording = async () => {
    try {
      logger.info('Starting recording...');
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, {mimeType});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        logger.info('Recording stopped, creating blob...', { mimeType, chunks: chunksRef.current.length });
        const blob = new Blob(chunksRef.current, {type: mimeType});

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Start transcribing
        setState('transcribing');

        // Check if we're in an enhancement mode
        const whisperMode =
          window.localStorage.getItem('whisperMode') || 'default';
        const isEnhancementMode =
          whisperMode === 'prompt' ||
          whisperMode === 'vibe' ||
          whisperMode === 'instructions' ||
          whisperMode === 'architect';

        // Set up a timer to switch to processing state for enhancement modes
        let processingTimer;
        if (isEnhancementMode) {
          processingTimer = setTimeout(() => {
            setState('processing');
          }, 2000); // Switch to processing after 2 seconds
        }

        try {
          const text = await transcribeWithWhisper(blob);
          if (text && onTranscript) {
            onTranscript(text);
          }
        } catch (err) {
          logger.error('Transcription error', { error: err.message, stack: err.stack });
          setError(err.message);
        } finally {
          if (processingTimer) {
            clearTimeout(processingTimer);
          }
          setState('idle');
        }
      };

      recorder.start();
      setState('recording');
      logger.info('Recording started successfully');
    } catch (err) {
      logger.error('Failed to start recording', { error: err.message, stack: err.stack });
      setError('Microphone access denied');
      setState('idle');
    }
  };

  // Stop recording
  const stopRecording = () => {
    logger.info('Stopping recording...');
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      // Don't set state here - let the onstop handler do it
    } else {
      // If recorder isn't in recording state, force cleanup
      logger.warn('Recorder not in recording state, forcing cleanup');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setState('idle');
    }
  };

  // Handle button click
  const handleClick = (e) => {
    // Prevent double firing on mobile
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Debounce for mobile double-tap issue
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (logger.isLevelEnabled('debug')) {
        logger.debug('Ignoring rapid tap', { timeDiff: now - lastTapRef.current });
      }
      return;
    }
    lastTapRef.current = now;

    if (logger.isLevelEnabled('debug')) {
      logger.debug('Button clicked', { currentState: state });
    }

    if (state === 'idle') {
      startRecording();
    } else if (state === 'recording') {
      stopRecording();
    }
    // Do nothing if transcribing or processing
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Button appearance based on state
  const getButtonAppearance = () => {
    switch (state) {
      case 'recording':
        return {
          icon: <Mic className="w-5 h-5 text-white" />,
          className: 'bg-red-500 hover:bg-red-600 animate-pulse',
          disabled: false,
        };
      case 'transcribing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          className: 'bg-blue-500 hover:bg-blue-600',
          disabled: true,
        };
      case 'processing':
        return {
          icon: <Brain className="w-5 h-5 animate-pulse" />,
          className: 'bg-purple-500 hover:bg-purple-600',
          disabled: true,
        };
      default: // idle
        return {
          icon: <Mic className="w-5 h-5" />,
          className: 'bg-gray-700 hover:bg-gray-600',
          disabled: false,
        };
    }
  };

  const {icon, className: buttonClass, disabled} = getButtonAppearance();

  return (
    <div className="relative">
      <button
        type="button"
        style={{
          backgroundColor:
            state === 'recording'
              ? '#ef4444'
              : state === 'transcribing'
                ? '#3b82f6'
                : state === 'processing'
                  ? '#a855f7'
                  : '#374151',
        }}
        data-testid="mic-button"
        className={`
          flex items-center justify-center
          w-12 h-12 rounded-full
          text-white transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          dark:ring-offset-gray-800
          touch-action-manipulation
          ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
          ${state === 'recording' ? 'animate-pulse' : ''}
          hover:opacity-90
          ${className}
        `}
        onClick={handleClick}
        disabled={disabled}
      >
        {icon}
      </button>

      {error && (
        <div
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                        bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10
                        animate-fade-in"
        >
          {error}
        </div>
      )}

      {state === 'recording' && (
        <div className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping pointer-events-none" />
      )}

      {state === 'processing' && (
        <div className="absolute -inset-1 rounded-full border-2 border-purple-500 animate-ping pointer-events-none" />
      )}
    </div>
  );
}
