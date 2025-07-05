// Recording state machine states
export const RecordingStates = {
  IDLE: 'idle',
  RECORDING: 'recording',
  TRANSCRIBING: 'transcribing',
  PROCESSING: 'processing'
};

// Check if we're in an enhancement mode
export const isEnhancementMode = () => {
  const whisperMode = window.localStorage.getItem('whisperMode') || 'default';
  return ['prompt', 'vibe', 'instructions', 'architect'].includes(whisperMode);
};

// Get the appropriate MIME type for recording
export const getRecordingMimeType = () => {
  return MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
};

// Clean up media stream
export const cleanupStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

// Create blob from recorded chunks
export const createAudioBlob = (chunks, mimeType) => {
  return new Blob(chunks, { type: mimeType });
};

// Check for rapid taps (debouncing)
export const isRapidTap = (lastTapTime, threshold = 300) => {
  const now = Date.now();
  return now - lastTapTime < threshold;
};

// Get button appearance configuration based on state
export const getButtonConfig = (state) => {
  switch (state) {
    case RecordingStates.RECORDING:
      return {
        iconType: 'mic',
        iconProps: { className: 'w-5 h-5 text-white' },
        animateIcon: false,
        animateButton: true,
        disabled: false,
        showRing: true,
        ringColor: 'red'
      };
    
    case RecordingStates.TRANSCRIBING:
      return {
        iconType: 'loader',
        iconProps: { className: 'w-5 h-5 animate-spin' },
        animateIcon: true,
        animateButton: false,
        disabled: true,
        showRing: false,
        ringColor: null
      };
    
    case RecordingStates.PROCESSING:
      return {
        iconType: 'brain',
        iconProps: { className: 'w-5 h-5 animate-pulse' },
        animateIcon: true,
        animateButton: false,
        disabled: true,
        showRing: true,
        ringColor: 'purple'
      };
    
    default: // IDLE
      return {
        iconType: 'mic',
        iconProps: { className: 'w-5 h-5' },
        animateIcon: false,
        animateButton: false,
        disabled: false,
        showRing: false,
        ringColor: null
      };
  }
};

// State transition logic
export const canTransitionTo = (currentState, nextState) => {
  const transitions = {
    [RecordingStates.IDLE]: [RecordingStates.RECORDING],
    [RecordingStates.RECORDING]: [RecordingStates.TRANSCRIBING, RecordingStates.IDLE],
    [RecordingStates.TRANSCRIBING]: [RecordingStates.PROCESSING, RecordingStates.IDLE],
    [RecordingStates.PROCESSING]: [RecordingStates.IDLE]
  };
  
  return transitions[currentState]?.includes(nextState) || false;
};

// Handle click action based on current state
export const getClickAction = (state) => {
  switch (state) {
    case RecordingStates.IDLE:
      return 'start';
    case RecordingStates.RECORDING:
      return 'stop';
    case RecordingStates.TRANSCRIBING:
    case RecordingStates.PROCESSING:
      return 'none';
    default:
      return 'none';
  }
};