export interface WhisperOptions {
  mode?: string;
}

export interface WhisperResponse {
  text: string;
  error?: string;
}

export interface WhisperError {
  error: string;
}

export type StatusCallback = (
  status: "transcribing" | "completed" | "error",
) => void;

export async function transcribeWithWhisper(
  audioBlob: Blob,
  onStatusChange?: StatusCallback,
): Promise<string> {
  const formData = new FormData();
  const fileName = `recording_${Date.now()}.webm`;
  const file = new File([audioBlob], fileName, { type: audioBlob.type });

  formData.append("audio", file);

  const whisperMode: string =
    window.localStorage.getItem("whisperMode") ?? "default";
  formData.append("mode", whisperMode);

  try {
    // Start with transcribing state
    if (onStatusChange) {
      onStatusChange("transcribing");
    }

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData: WhisperError = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ??
          `Transcription error: ${response.status} ${response.statusText}`,
      );
    }

    const data: WhisperResponse = await response.json();
    return data.text ?? "";
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "TypeError" &&
      error.message.includes("fetch")
    ) {
      throw new Error(
        "Cannot connect to server. Please ensure the backend is running.",
      );
    }
    throw error;
  }
}
