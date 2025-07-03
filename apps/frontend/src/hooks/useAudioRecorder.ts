import { useState, useRef, useCallback } from "react";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";

export interface AudioRecorderControls {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useAudioRecorder(): AudioRecorderControls {
  const logger: Logger = useLogger({ component: "AudioRecorder" });
  const [isRecording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      // Request microphone access
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Determine supported MIME type
      const mimeType: string = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      // Create media recorder
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      // Set up event handlers
      recorder.ondataavailable = (e: BlobEvent): void => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = (): void => {
        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.onerror = (event: Event): void => {
        logger.error("MediaRecorder error", { event });
        setError("Recording failed");
        setRecording(false);
      };

      // Start recording
      recorder.start();
      setRecording(true);
      if (logger.isLevelEnabled("debug")) {
        logger.debug("Recording started");
      }
    } catch (err) {
      logger.error("Failed to start recording", { error: err });
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start recording";
      setError(errorMessage);
      setRecording(false);
    }
  }, [logger]);

  const stop = useCallback((): void => {
    if (logger.isLevelEnabled("debug")) {
      logger.debug("Stop called", {
        recorderState: mediaRecorderRef.current?.state,
      });
    }

    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
        if (logger.isLevelEnabled("debug")) {
          logger.debug("Recording stopped");
        }
      }
    } catch (err) {
      logger.error("Error stopping recorder", { error: err });
    }

    // Always update state
    setRecording(false);

    // Clean up stream if still active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [logger]);

  const reset = useCallback((): void => {
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
    reset,
  };
}
