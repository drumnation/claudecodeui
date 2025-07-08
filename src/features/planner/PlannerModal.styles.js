import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`md:p-3 md:border-b md:border-border md:bg-muted/30`}
`;

// Desktop styles
export const DesktopForm = styled.div`
  ${tw`hidden md:block space-y-3`}
`;

export const FormHeader = styled.div`
  ${tw`flex items-start gap-3 text-sm font-medium text-foreground`}
`;

export const FormSection = styled.div`
  ${tw`space-y-2`}
`;

export const SectionLabel = styled.label`
  ${tw`text-xs font-medium text-foreground`}
`;

export const TextArea = styled.textarea`
  ${tw`w-full text-sm p-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none`}
`;

export const CharacterCount = styled.div`
  ${tw`text-xs text-muted-foreground text-right`}
`;

export const AgentGrid = styled.div`
  ${tw`grid grid-cols-1 gap-2`}
`;

export const AgentCard = styled.div`
  ${tw`p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm`}
  ${({ selected }) => selected 
    ? tw`border-primary bg-primary/5` 
    : tw`border-border hover:border-primary/50`
  }
  ${({ disabled }) => disabled && tw`opacity-50 cursor-not-allowed`}
`;

export const AgentHeader = styled.div`
  ${tw`flex items-center gap-2 mb-1`}
`;

export const AgentName = styled.div`
  ${tw`font-medium text-sm flex-1`}
`;

export const AgentCheckbox = styled.div`
  ${tw`w-4 h-4 rounded border border-border flex items-center justify-center`}
  ${({ checked }) => checked && tw`bg-primary border-primary`}
  
  &::after {
    content: ${({ checked }) => checked ? '"✓"' : '""'};
    ${tw`text-xs text-primary-foreground`}
  }
`;

export const AgentDescription = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const PlanningSection = styled.div`
  ${tw`space-y-3`}
`;

export const ProgressHeader = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const ProgressTitle = styled.div`
  ${tw`text-sm font-medium`}
`;

export const ProgressPercentage = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const ProgressBar = styled.div`
  ${tw`w-full h-2 bg-muted rounded-full overflow-hidden`}
`;

export const ProgressFill = styled.div`
  ${tw`h-full bg-primary transition-all duration-300`}
  width: ${({ width }) => width}%;
`;

export const AgentStatusGrid = styled.div`
  ${tw`space-y-2`}
`;

export const AgentStatusCard = styled.div`
  ${tw`p-2 rounded-md border`}
  ${({ status }) => {
    switch (status) {
      case 'completed':
        return tw`border-green-200 bg-green-50`;
      case 'running':
        return tw`border-blue-200 bg-blue-50`;
      case 'failed':
        return tw`border-red-200 bg-red-50`;
      default:
        return tw`border-border bg-muted/30`;
    }
  }}
`;

export const AgentStatusHeader = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const AgentStatusName = styled.div`
  ${tw`text-sm font-medium flex-1`}
`;

export const AgentDuration = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const AgentOutput = styled.div`
  ${tw`text-xs text-muted-foreground mt-1 font-mono`}
`;

export const PlanResultSection = styled.div`
  ${tw`space-y-2 p-3 rounded-md bg-green-50 border border-green-200`}
`;

export const PlanHeader = styled.div`
  ${tw`flex items-center gap-2 text-sm font-medium text-green-700`}
`;

export const PlanPreview = styled.div`
  ${tw`text-xs text-green-600 font-mono bg-white p-2 rounded border`}
`;

export const ErrorMessage = styled.div`
  ${tw`flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200`}
`;

export const FormActions = styled.div`
  ${tw`flex gap-2`}
`;

// Mode selection tabs
export const ModeTabs = styled.div`
  ${tw`flex rounded-lg bg-muted p-1 gap-1`}
`;

export const ModeTab = styled.button`
  ${tw`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all`}
  ${({ active }) => active 
    ? tw`bg-background text-foreground shadow-sm` 
    : tw`text-muted-foreground hover:text-foreground`
  }
`;

// Auto-generate toggle
export const AutoGenerateToggle = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const ToggleCheckbox = styled.input`
  ${tw`w-4 h-4 text-primary rounded border-border focus:ring-primary/20`}
`;

export const ToggleLabel = styled.label`
  ${tw`text-sm text-foreground cursor-pointer`}
`;

// Mobile styles
export const MobileOverlay = styled.div`
  ${tw`md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}
`;

export const MobileModal = styled.div`
  ${tw`absolute left-0 right-0 bg-card rounded-t-lg border-t border-border p-4 space-y-4`}
  bottom: calc(env(safe-area-inset-bottom, 0px) + 48px);
  animation: slide-up 0.3s ease-out;
  max-height: 85vh;
  overflow-y: auto;
  
  @keyframes slide-up {
    from {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 48px));
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const MobileHeader = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const MobileHeaderContent = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const MobileIconWrapper = styled.div`
  ${tw`w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center`}
`;

export const MobileTitle = styled.h2`
  ${tw`text-base font-semibold text-foreground`}
`;

export const MobileSubtitle = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const MobileCloseButton = styled.button`
  ${tw`w-6 h-6 rounded-md bg-muted flex items-center justify-center active:scale-95 transition-transform`}
`;

export const MobileFormContent = styled.div`
  ${tw`space-y-4`}
`;

export const MobileSection = styled.div`
  ${tw`space-y-2`}
`;

export const MobileSectionLabel = styled.label`
  ${tw`text-xs font-medium text-foreground`}
`;

export const MobileTextArea = styled.textarea`
  ${tw`w-full text-sm p-3 rounded-md border border-border bg-background focus:border-primary transition-colors resize-none`}
`;

export const MobileCharacterCount = styled.div`
  ${tw`text-xs text-muted-foreground text-right`}
`;

export const MobileAgentGrid = styled.div`
  ${tw`space-y-2`}
`;

export const MobileAgentCard = styled.div`
  ${tw`p-3 rounded-md border active:scale-95 transition-all`}
  ${({ selected }) => selected 
    ? tw`border-primary bg-primary/5` 
    : tw`border-border`
  }
  ${({ disabled }) => disabled && tw`opacity-50`}
`;

export const MobileAgentHeader = styled.div`
  ${tw`flex items-center gap-2 mb-1`}
`;

export const MobileAgentName = styled.div`
  ${tw`font-medium text-sm flex-1`}
`;

export const MobileAgentCheckbox = styled.div`
  ${tw`w-4 h-4 rounded border border-border flex items-center justify-center`}
  ${({ checked }) => checked && tw`bg-primary border-primary`}
  
  &::after {
    content: ${({ checked }) => checked ? '"✓"' : '""'};
    ${tw`text-xs text-primary-foreground`}
  }
`;

export const MobileAgentDescription = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const MobilePlanningSection = styled.div`
  ${tw`space-y-3`}
`;

export const MobileProgressHeader = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const MobileProgressTitle = styled.div`
  ${tw`text-sm font-medium`}
`;

export const MobileProgressPercentage = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const MobileProgressBar = styled.div`
  ${tw`w-full h-2 bg-muted rounded-full overflow-hidden`}
`;

export const MobileProgressFill = styled.div`
  ${tw`h-full bg-primary transition-all duration-300`}
  width: ${({ width }) => width}%;
`;

export const MobileAgentStatusList = styled.div`
  ${tw`space-y-2`}
`;

export const MobileAgentStatusItem = styled.div`
  ${tw`p-2 rounded-md border`}
  ${({ status }) => {
    switch (status) {
      case 'completed':
        return tw`border-green-200 bg-green-50`;
      case 'running':
        return tw`border-blue-200 bg-blue-50`;
      case 'failed':
        return tw`border-red-200 bg-red-50`;
      default:
        return tw`border-border bg-muted/30`;
    }
  }}
`;

export const MobileAgentStatusHeader = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const MobileAgentStatusName = styled.div`
  ${tw`text-sm font-medium flex-1`}
`;

export const MobileAgentDuration = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const MobilePlanResult = styled.div`
  ${tw`space-y-2 p-3 rounded-md bg-green-50 border border-green-200`}
`;

export const MobilePlanHeader = styled.div`
  ${tw`flex items-center gap-2 text-sm font-medium text-green-700`}
`;

export const MobilePlanPreview = styled.div`
  ${tw`text-xs text-green-600 font-mono bg-white p-2 rounded border`}
`;

export const MobileErrorMessage = styled.div`
  ${tw`flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200`}
`;

export const MobileActions = styled.div`
  ${tw`flex gap-2`}
`;

export const SafeArea = styled.div`
  ${tw`h-4`}
`;