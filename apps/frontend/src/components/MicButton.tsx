import React, { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Brain } from "lucide-react";
import { transcribeWithWhisper } from "../utils/whisper";
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

  // Start recording
  const startRecording = async (): Promise<void> => {
    try {
      logger.info("Starting recording...");
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

      recorder.ondataavailable = (e: BlobEvent): void => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async (): Promise<void> => {
        logger.info("Recording stopped, creating blob...", {
          mimeType,
          chunks: chunksRef.current.length,
        });
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
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

        // Set up a timer to switch to processing state for enhancement modes
        let processingTimer: NodeJS.Timeout | undefined;
        if (isEnhancementMode) {
          processingTimer = setTimeout(() => {
            setState("processing");
          }, 2000); // Switch to processing after 2 seconds
        }

        try {
          const text: string = await transcribeWithWhisper(blob);
          if (text && onTranscript) {
            onTranscript(text);
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          const errorStack = err instanceof Error ? err.stack : undefined;
          logger.error("Transcription error", {
            error: errorMessage,
            stack: errorStack,
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
      logger.info("Recording started successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error("Failed to start recording", {
        error: errorMessage,
        stack: errorStack,
      });
      setError("Microphone access denied");
      setState("idle");
    }
  };

  // Stop recording
  const stopRecording = (): void => {
    logger.info("Stopping recording...");
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // Don't set state here - let the onstop handler do it
    } else {
      // If recorder isn't in recording state, force cleanup
      logger.warn("Recorder not in recording state, forcing cleanup");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
      if (logger.isLevelEnabled("debug")) {
        logger.debug("Ignoring rapid tap", {
          timeDiff: now - lastTapRef.current,
        });
      }
      return;
    }
    lastTapRef.current = now;

    if (logger.isLevelEnabled("debug")) {
      logger.debug("Button clicked", { currentState: state });
    }

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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
