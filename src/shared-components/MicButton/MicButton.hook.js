import { useState, useEffect, useRef, useCallback } from 'react';
import { transcribeWithWhisper } from '@/utils/whisper';
import {
  RecordingStates,
  isEnhancementMode,
  getRecordingMimeType,
  cleanupStream,
  createAudioBlob,
  isRapidTap,
  getButtonConfig,
  getClickAction
} from '@/shared-components/MicButton/MicButton.logic';

export const useMicButton = ({ onTranscript }) => {
  // State management
  const [state, setState] = useState(RecordingStates.IDLE);
  const [error, setError] = useState(null);
  
  // Refs for recording management
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const lastTapRef = useRef(0);
  
  // Version indicator for debugging
  useEffect(() => {
    console.log('MicButton v2.0 loaded');
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log('Starting recording...');
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getRecordingMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        console.log('Recording stopped, creating blob...');
        const blob = createAudioBlob(chunksRef.current, mimeType);
        
        // Clean up stream
        cleanupStream(streamRef.current);
        streamRef.current = null;

        // Start transcribing
        setState(RecordingStates.TRANSCRIBING);
        
        // Set up a timer to switch to processing state for enhancement modes
        let processingTimer;
        if (isEnhancementMode()) {
          processingTimer = setTimeout(() => {
            setState(RecordingStates.PROCESSING);
          }, 2000); // Switch to processing after 2 seconds
        }
        
        try {
          const text = await transcribeWithWhisper(blob);
          if (text && onTranscript) {
            onTranscript(text);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setError(err.message);
        } finally {
          if (processingTimer) {
            clearTimeout(processingTimer);
          }
          setState(RecordingStates.IDLE);
        }
      };

      recorder.start();
      setState(RecordingStates.RECORDING);
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Microphone access denied');
      setState(RecordingStates.IDLE);
    }
  }, [onTranscript]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      // Don't set state here - let the onstop handler do it
    } else {
      // If recorder isn't in recording state, force cleanup
      console.log('Recorder not in recording state, forcing cleanup');
      cleanupStream(streamRef.current);
      streamRef.current = null;
      setState(RecordingStates.IDLE);
    }
  }, []);

  // Handle button click
  const handleClick = useCallback((e) => {
    // Prevent double firing on mobile
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Debounce for mobile double-tap issue
    if (isRapidTap(lastTapRef.current)) {
      console.log('Ignoring rapid tap');
      return;
    }
    lastTapRef.current = Date.now();
    
    console.log('Button clicked, current state:', state);
    
    const action = getClickAction(state);
    switch (action) {
      case 'start':
        startRecording();
        break;
      case 'stop':
        stopRecording();
        break;
      case 'none':
      default:
        // Do nothing if transcribing or processing
        break;
    }
  }, [state, startRecording, stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupStream(streamRef.current);
    };
  }, []);

  // Get button configuration
  const buttonConfig = getButtonConfig(state);

  return {
    state,
    error,
    handleClick,
    buttonConfig
  };
};