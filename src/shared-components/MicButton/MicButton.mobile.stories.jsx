import React from 'react';
import { MicButton } from '@/shared-components/MicButton/MicButton';
import { RecordingStates } from '@/shared-components/MicButton/MicButton.logic';

export default {
  title: 'Shared Components/Mobile/MicButton',
  component: MicButton,
  parameters: {
    layout: 'centered',
    docs: {
      autodocs: true,
      description: {
        component: 'Mobile version of MicButton component with touch-friendly interactions.'
      }
    }
  },
  globals: {
    viewport: {
      value: 'iphone12',
      isRotated: false
    }
  },
  argTypes: {
    onTranscript: { action: 'transcript received' },
    className: { control: 'text' }
  }
};

// Default mobile story
export const Default = {
  args: {
    className: ''
  }
};

// Story with custom class
export const WithCustomClass = {
  args: {
    className: 'custom-mic-button'
  }
};

// Interactive story for testing different states on mobile
export const InteractiveStates = {
  render: (args) => {
    const [currentState, setCurrentState] = React.useState(RecordingStates.IDLE);
    const [showError, setShowError] = React.useState(false);
    
    // Override the hook to use our controlled state
    const OriginalMicButton = MicButton;
    const MockedMicButton = (props) => {
      const originalHook = React.useRef(null);
      
      // Intercept the hook
      React.useEffect(() => {
        const moduleExports = require('./MicButton.hook');
        originalHook.current = moduleExports.useMicButton;
        
        moduleExports.useMicButton = ({ onTranscript }) => {
          const result = originalHook.current({ onTranscript });
          return {
            ...result,
            state: currentState,
            error: showError ? 'Sample error message' : null,
            handleClick: () => {
              console.log('Button clicked in state:', currentState);
              if (currentState === RecordingStates.IDLE) {
                setCurrentState(RecordingStates.RECORDING);
              } else if (currentState === RecordingStates.RECORDING) {
                setCurrentState(RecordingStates.TRANSCRIBING);
              }
            }
          };
        };
        
        return () => {
          if (originalHook.current) {
            moduleExports.useMicButton = originalHook.current;
          }
        };
      }, []);
      
      return <OriginalMicButton {...props} />;
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <MockedMicButton {...args} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
          <button onClick={() => setCurrentState(RecordingStates.IDLE)} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            Set Idle
          </button>
          <button onClick={() => setCurrentState(RecordingStates.RECORDING)} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            Set Recording
          </button>
          <button onClick={() => setCurrentState(RecordingStates.TRANSCRIBING)} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            Set Transcribing
          </button>
          <button onClick={() => setCurrentState(RecordingStates.PROCESSING)} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
            Set Processing
          </button>
          <button onClick={() => setShowError(!showError)} style={{ padding: '0.5rem', fontSize: '0.875rem', gridColumn: '1 / -1' }}>
            Toggle Error
          </button>
        </div>
        
        <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          <p>Current State: <strong>{currentState}</strong></p>
          <p>Error Shown: <strong>{showError ? 'Yes' : 'No'}</strong></p>
        </div>
      </div>
    );
  }
};

// Story showing all states in mobile layout
export const AllStates = {
  render: (args) => {
    const states = [
      { state: RecordingStates.IDLE, label: 'Idle' },
      { state: RecordingStates.RECORDING, label: 'Recording' },
      { state: RecordingStates.TRANSCRIBING, label: 'Transcribing' },
      { state: RecordingStates.PROCESSING, label: 'Processing' }
    ];
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
        {states.map(({ state, label }) => (
          <div key={state} style={{ textAlign: 'center' }}>
            <MicButtonMock {...args} forcedState={state} />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{label}</p>
          </div>
        ))}
      </div>
    );
  }
};

// Story with error state
export const WithError = {
  render: (args) => {
    return <MicButtonMock {...args} forcedError="Microphone access denied" />;
  }
};

// Mock component for displaying specific states
const MicButtonMock = ({ forcedState, forcedError, ...props }) => {
  const OriginalMicButton = MicButton;
  
  // Create a wrapper that overrides the hook
  const MockedMicButton = (componentProps) => {
    const { useMicButton } = require('./MicButton.hook');
    const originalResult = useMicButton({ onTranscript: componentProps.onTranscript });
    
    // Override specific values if forced
    const mockedResult = {
      ...originalResult,
      state: forcedState || originalResult.state,
      error: forcedError || originalResult.error,
      handleClick: () => console.log('Mock button clicked')
    };
    
    // Temporarily replace the hook
    const moduleExports = require('./MicButton.hook');
    const originalHook = moduleExports.useMicButton;
    moduleExports.useMicButton = () => mockedResult;
    
    // Render the component
    const element = <OriginalMicButton {...componentProps} />;
    
    // Restore the original hook
    moduleExports.useMicButton = originalHook;
    
    return element;
  };
  
  return <MockedMicButton {...props} />;
};