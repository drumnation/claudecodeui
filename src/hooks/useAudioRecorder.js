import { useState, useRef, useCallback } from 'react';
import { createLogger } from '@kit/logger/browser';

const logger = createLogger({ scope: 'audio-recorder' });

export function useAudioRecorder() {
  const [isRecording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const start = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      streamRef.current = stream;

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      // Create media recorder
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      // Set up event handlers
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.onerror = (event) => {
        logger.error('MediaRecorder error', {
          event,
          error: event.error,
          mimeType,
          recorderState: recorder.state
        });
        setError('Recording failed');
        setRecording(false);
      };

      // Start recording
      recorder.start();
      setRecording(true);
      logger.info('Recording started', {
        mimeType,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      });
    } catch (err) {
      logger.error('Failed to start recording', {
        error: err,
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      setError(err.message || 'Failed to start recording');
      setRecording(false);
    }
  }, []);

  const stop = useCallback(() => {
    const recorderState = mediaRecorderRef.current?.state;
    logger.debug('Stop called', { recorderState });
    
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        logger.info('Recording stopped', {
          recordingDuration: 'unknown', // Could track this if needed
          chunksCount: chunksRef.current.length
        });
      }
    } catch (err) {
      logger.error('Error stopping recorder', {
        error: err,
        recorderState,
        stack: err.stack
      });
    }
    
    // Always update state
    setRecording(false);
    
    // Clean up stream if still active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
  }, []);

  return { 
    isRecording, 
    audioBlob, 
    error,
    start, 
    stop, 
    reset 
  };
}