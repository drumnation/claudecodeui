import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Brain } from "lucide-react";
import { transcribeWithWhisper } from "@/utils/whisper";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";

export type MicButtonState =
  | "idle"
  | "recording"
  | "transcribing"
  | "processing";

export interface MicButtonProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

export interface ButtonAppearance {
  icon: React.ReactNode;
  className: string;
  disabled: boolean;
}

export function MicButton({ onTranscript, className = "" }: MicButtonProps) {
  const logger: Logger = useLogger({ scope: "MicButton" });
  const [state, setState] = useState<MicButtonState>("idle");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const lastTapRef = useRef<number>(0);

  // Log state changes
  useEffect(() => {
    logger.debug('MicButton state changed', { 
      newState: state, 
      hasError: !!error,
      timestamp: Date.now()
    });
  }, [state, error, logger]);

  // Start recording
  const startRecording = async (): Promise<void> => {
    try {
      logger.info("Starting audio recording", {
        userAgent: navigator.userAgent,
        mediaDevicesSupported: !!navigator.mediaDevices
      });
      setError(null);
      chunksRef.current = [];

      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const mimeType: string = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      logger.debug('MediaRecorder configured', { 
        mimeType, 
        state: recorder.state,
        audioTracks: stream.getAudioTracks().length
      });

      recorder.ondataavailable = (e: BlobEvent): void => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          logger.debug('Audio chunk received', { 
            chunkSize: e.data.size,
            totalChunks: chunksRef.current.length
          });
        }
      };

      recorder.onstop = async (): Promise<void> => {
        logger.info("Recording stopped, processing audio", {
          mimeType,
          chunks: chunksRef.current.length,
          totalSize: chunksRef.current.reduce((acc, chunk) => 
            acc + (chunk instanceof Blob ? chunk.size : 0), 0
          )
        });
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
            logger.debug('Audio track stopped', { trackLabel: track.label });
          });
          streamRef.current = null;
        }

        // Start transcribing
        setState("transcribing");

        // Check if we're in an enhancement mode
        const whisperMode: string =
          window.localStorage.getItem("whisperMode") || "default";
        const isEnhancementMode: boolean =
          whisperMode === "prompt" ||
          whisperMode === "vibe" ||
          whisperMode === "instructions" ||
          whisperMode === "architect";

        logger.debug('Whisper mode configuration', { 
          whisperMode, 
          isEnhancementMode,
          blobSize: blob.size
        });

        // Set up a timer to switch to processing state for enhancement modes
        let processingTimer: NodeJS.Timeout | undefined;
        if (isEnhancementMode) {
          processingTimer = setTimeout(() => {
            logger.debug('Switching to processing state for enhancement mode');
            setState("processing");
          }, 2000); // Switch to processing after 2 seconds
        }

        try {
          const transcriptionStart = Date.now();
          const text: string = await transcribeWithWhisper(blob);
          const transcriptionTime = Date.now() - transcriptionStart;
          
          logger.info('Transcription completed', {
            transcriptionTime,
            textLength: text?.length || 0,
            hasText: !!text,
            whisperMode
          });

          if (text && onTranscript) {
            onTranscript(text);
            logger.debug('Transcript delivered to parent component', {
              textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
            });
          } else if (!text) {
            logger.warn('Empty transcript received from Whisper');
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          const errorStack = err instanceof Error ? err.stack : undefined;
          logger.error("Transcription failed", {
            error: errorMessage,
            stack: errorStack,
            blobSize: blob.size,
            whisperMode
          });
          setError(errorMessage);
        } finally {
          if (processingTimer) {
            clearTimeout(processingTimer);
          }
          setState("idle");
        }
      };

      recorder.start();
      setState("recording");
      logger.info("Audio recording started successfully", { mimeType });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error("Failed to start audio recording", {
        error: errorMessage,
        stack: errorStack,
        hasMediaDevices: !!navigator.mediaDevices,
        isSecureContext: window.isSecureContext
      });
      setError("Microphone access denied");
      setState("idle");
    }
  };

  // Stop recording
  const stopRecording = (): void => {
    logger.info("Stopping audio recording", {
      recorderState: mediaRecorderRef.current?.state,
      hasStream: !!streamRef.current
    });
    
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // Don't set state here - let the onstop handler do it
    } else {
      // If recorder isn't in recording state, force cleanup
      logger.warn("Recorder not in recording state, forcing cleanup", {
        recorderState: mediaRecorderRef.current?.state
      });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          logger.debug('Force stopped audio track', { trackLabel: track.label });
        });
        streamRef.current = null;
      }
      setState("idle");
    }
  };

  // Handle button click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    // Prevent double firing on mobile
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Debounce for mobile double-tap issue
    const now: number = Date.now();
    if (now - lastTapRef.current < 300) {
      logger.debug("Ignoring rapid tap to prevent double-firing", {
        timeDiff: now - lastTapRef.current,
        currentState: state
      });
      return;
    }
    lastTapRef.current = now;

    logger.debug("MicButton clicked", { 
      currentState: state,
      timestamp: now,
      userAgent: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
    });

    if (state === "idle") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
    // Do nothing if transcribing or processing
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      logger.debug('MicButton unmounting, cleaning up resources');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          logger.debug('Cleanup: stopped audio track', { trackLabel: track.label });
        });
      }
    };
  }, [logger]);

  // Button appearance based on state
  const getButtonAppearance = (): ButtonAppearance => {
    switch (state) {
      case "recording":
        return {
          icon: <Mic className="w-5 h-5 text-white" />,
          className: "bg-red-500 hover:bg-red-600 animate-pulse",
          disabled: false,
        };
      case "transcribing":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          className: "bg-blue-500 hover:bg-blue-600",
          disabled: true,
        };
      case "processing":
        return {
          icon: <Brain className="w-5 h-5 animate-pulse" />,
          className: "bg-purple-500 hover:bg-purple-600",
          disabled: true,
        };
      default: // idle
        return {
          icon: <Mic className="w-5 h-5" />,
          className: "bg-gray-700 hover:bg-gray-600",
          disabled: false,
        };
    }
  };

  const {
    icon,
    className: buttonClass,
    disabled,
  }: ButtonAppearance = getButtonAppearance();

  return (
    <div className="relative">
      <button
        type="button"
        style={{
          backgroundColor:
            state === "recording"
              ? "#ef4444"
              : state === "transcribing"
                ? "#3b82f6"
                : state === "processing"
                  ? "#a855f7"
                  : "#374151",
        }}
        data-testid="mic-button"
        className={`
          flex items-center justify-center
          w-12 h-12 rounded-full
          text-white transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          dark:ring-offset-gray-800
          touch-action-manipulation
          ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}
          ${state === "recording" ? "animate-pulse" : ""}
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

      {state === "recording" && (
        <div className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping pointer-events-none" />
      )}

      {state === "processing" && (
        <div className="absolute -inset-1 rounded-full border-2 border-purple-500 animate-ping pointer-events-none" />
      )}
    </div>
  );
}