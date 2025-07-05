import styled from '@emotion/styled';
import tw from 'twin.macro';
import { RecordingStates } from '@/shared-components/MicButton/MicButton.logic';

export const MicButtonContainer = styled.div`
  ${tw`relative`}
`;

export const StyledButton = styled.button`
  ${tw`
    flex items-center justify-center
    w-10 h-10 rounded-full
    text-white transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    dark:ring-offset-gray-800
    hover:opacity-90
  `}
  
  touch-action: manipulation;
  
  /* Dynamic background color based on state */
  background-color: ${({ $state }) => {
    switch ($state) {
      case RecordingStates.RECORDING:
        return '#ef4444'; // red-500
      case RecordingStates.TRANSCRIBING:
        return '#3b82f6'; // blue-500
      case RecordingStates.PROCESSING:
        return '#a855f7'; // purple-500
      default:
        return '#374151'; // gray-700
    }
  }};
  
  /* Disabled state */
  ${({ $disabled }) => $disabled && tw`cursor-not-allowed opacity-75`}
  ${({ $disabled }) => !$disabled && tw`cursor-pointer`}
  
  /* Animation for recording state */
  ${({ $animateButton }) => $animateButton && tw`animate-pulse`}
`;

export const ErrorMessage = styled.div`
  ${tw`
    absolute top-full mt-2 left-1/2 transform -translate-x-1/2
    bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10
  `}
  
  animation: fadeIn 0.2s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -5px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

export const AnimatedRing = styled.div`
  ${tw`
    absolute -inset-1 rounded-full border-2 animate-ping pointer-events-none
  `}
  
  border-color: ${({ $color }) => {
    switch ($color) {
      case 'red':
        return '#ef4444'; // red-500
      case 'purple':
        return '#a855f7'; // purple-500
      default:
        return 'transparent';
    }
  }};
`;