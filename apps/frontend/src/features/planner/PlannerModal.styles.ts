import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`md:p-3 md:border-b md:border-border md:bg-muted/30 dark:md:bg-muted/20`}
`;

// Desktop styles
export const DesktopForm = styled.div`
  ${tw`hidden md:block space-y-3 bg-background dark:bg-gray-900 rounded-lg p-4`}
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
  ${tw`w-full text-sm p-2 rounded-md border border-border bg-background dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none`}
`;

export const CharacterCount = styled.div`
  ${tw`text-xs text-muted-foreground text-right`}
`;

export const AgentGrid = styled.div`
  ${tw`grid grid-cols-1 gap-2`}
`;

export const AgentCard = styled.div`
  ${tw`p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm`}
  ${({selected}: any) =>
    selected
      ? tw`border-primary bg-primary/5 dark:bg-primary/10`
      : tw`border-border dark:border-gray-600 hover:border-primary/50 dark:hover:border-primary/70`}
  ${({disabled}: any) => disabled && tw`opacity-50 cursor-not-allowed`}
`;

export const AgentHeader = styled.div`
  ${tw`flex items-center gap-2 mb-1`}
`;

export const AgentName = styled.div`
  ${tw`font-medium text-sm flex-1`}
`;

export const AgentCheckbox = styled.div`
  ${tw`w-4 h-4 rounded border border-border flex items-center justify-center`}
  ${({checked}: any) => checked && tw`bg-primary border-primary`}
  
  &::after {
    content: ${({checked}: any) => (checked ? '"✓"' : '""')};
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
  ${tw`w-full h-2 bg-muted dark:bg-gray-700 rounded-full overflow-hidden`}
`;

export const ProgressFill = styled.div`
  ${tw`h-full bg-primary transition-all duration-300`}
  width: ${({width}: any) => width}%;
`;

export const AgentStatusGrid = styled.div`
  ${tw`space-y-2`}
`;

export const AgentStatusCard = styled.div`
  ${tw`p-2 rounded-md border`}
  ${({status}: any) => {
    switch (status) {
      case 'completed':
        return tw`border-green-500/20 bg-green-500/10 dark:border-green-400/20 dark:bg-green-400/10`;
      case 'running':
        return tw`border-blue-500/20 bg-blue-500/10 dark:border-blue-400/20 dark:bg-blue-400/10`;
      case 'failed':
        return tw`border-red-500/20 bg-red-500/10 dark:border-red-400/20 dark:bg-red-400/10`;
      default:
        return tw`border-border bg-muted/30`;
    }
  }}
`;

export const AgentStatusHeader = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const AgentStatusName = styled.div`
  ${tw`text-sm font-medium flex-1 text-foreground`}
`;

export const AgentDuration = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const AgentOutput = styled.div`
  ${tw`text-xs text-muted-foreground mt-1 font-mono`}
`;

export const PlanResultSection = styled.div`
  ${tw`space-y-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 dark:bg-green-400/10 dark:border-green-400/20`}
`;

export const PlanHeader = styled.div`
  ${tw`flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400`}
`;

export const PlanPreview = styled.div`
  ${tw`text-xs text-green-600 dark:text-green-400 font-mono bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-600`}
`;

export const ErrorMessage = styled.div`
  ${tw`flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/20`}
`;

export const ErrorHelp = styled.div`
  ${tw`mt-1 text-xs text-red-500 dark:text-red-300`}

  code {
    ${tw`bg-red-900/20 px-1 py-0.5 rounded font-mono`}
  }
`;

export const FormActions = styled.div`
  ${tw`flex gap-2`}
`;

// Mode selection tabs
export const ModeTabs = styled.div`
  ${tw`flex rounded-lg bg-muted dark:bg-gray-800 p-1 gap-1`}
`;

export const ModeTab = styled.button`
  ${tw`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all`}
  ${({active}: any) =>
    active
      ? tw`bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 shadow-sm`
      : tw`text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-200`}
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

// Screenshot styles
export const ScreenshotContainer = styled.div`
  ${tw`space-y-3`}
`;

export const ScreenshotGrid = styled.div`
  ${tw`grid grid-cols-2 gap-2`}
`;

export const ScreenshotItem = styled.div`
  ${tw`relative rounded-lg overflow-hidden border border-border`}
`;

export const ScreenshotImage = styled.img`
  ${tw`w-full h-24 object-cover`}
`;

export const ScreenshotOverlay = styled.div`
  ${tw`absolute inset-0 bg-black/60 opacity-0 transition-opacity flex flex-col justify-between p-2`}
  ${ScreenshotItem}:hover & {
    ${tw`opacity-100`}
  }
`;

export const ScreenshotName = styled.div`
  ${tw`text-xs text-white truncate`}
`;

export const RemoveButton = styled.button`
  ${tw`self-end w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors`}
`;

export const ScreenshotActions = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const ScreenshotButton = styled.button`
  ${tw`flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-border rounded-md hover:border-primary hover:text-primary transition-colors`}
`;

export const ScreenshotHint = styled.span`
  ${tw`text-xs text-muted-foreground`}
`;

// Mobile styles
export const MobileOverlay = styled.div`
  ${tw`md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}
`;

export const MobileModal = styled.div`
  ${tw`absolute left-0 right-0 bg-card dark:bg-gray-900 rounded-t-lg border-t border-border dark:border-gray-700 p-4 space-y-4`}
  bottom: calc(env(safe-area-inset-bottom, 0px) + 48px);
  animation: slide-up 0.3s ease-out;
  max-height: 85vh;
  overflow-y: auto;

  @keyframes slide-up {
    from {
      transform: translateY(
        calc(100% + env(safe-area-inset-bottom, 0px) + 48px)
      );
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
  ${tw`w-full text-sm p-3 rounded-md border border-border bg-background dark:bg-gray-800 focus:border-primary transition-colors resize-none`}
`;

export const MobileCharacterCount = styled.div`
  ${tw`text-xs text-muted-foreground text-right`}
`;

export const MobileAgentGrid = styled.div`
  ${tw`space-y-2`}
`;

export const MobileAgentCard = styled.div`
  ${tw`p-3 rounded-md border active:scale-95 transition-all`}
  ${({selected}: any) =>
    selected
      ? tw`border-primary bg-primary/5 dark:bg-primary/10`
      : tw`border-border dark:border-gray-600`}
  ${({disabled}: any) => disabled && tw`opacity-50`}
`;

export const MobileAgentHeader = styled.div`
  ${tw`flex items-center gap-2 mb-1`}
`;

export const MobileAgentName = styled.div`
  ${tw`font-medium text-sm flex-1`}
`;

export const MobileAgentCheckbox = styled.div`
  ${tw`w-4 h-4 rounded border border-border flex items-center justify-center`}
  ${({checked}: any) => checked && tw`bg-primary border-primary`}
  
  &::after {
    content: ${({checked}: any) => (checked ? '"✓"' : '""')};
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
  width: ${({width}: any) => width}%;
`;

export const MobileAgentStatusList = styled.div`
  ${tw`space-y-2`}
`;

export const MobileAgentStatusItem = styled.div`
  ${tw`p-2 rounded-md border`}
  ${({status}: any) => {
    switch (status) {
      case 'completed':
        return tw`border-green-500/20 bg-green-500/10 dark:border-green-400/20 dark:bg-green-400/10`;
      case 'running':
        return tw`border-blue-500/20 bg-blue-500/10 dark:border-blue-400/20 dark:bg-blue-400/10`;
      case 'failed':
        return tw`border-red-500/20 bg-red-500/10 dark:border-red-400/20 dark:bg-red-400/10`;
      default:
        return tw`border-border bg-muted/30`;
    }
  }}
`;

export const MobileAgentStatusHeader = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const MobileAgentStatusName = styled.div`
  ${tw`text-sm font-medium flex-1 text-foreground`}
`;

export const MobileAgentDuration = styled.div`
  ${tw`text-xs text-muted-foreground`}
`;

export const MobilePlanResult = styled.div`
  ${tw`space-y-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 dark:bg-green-400/10 dark:border-green-400/20`}
`;

export const MobilePlanHeader = styled.div`
  ${tw`flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400`}
`;

export const MobilePlanPreview = styled.div`
  ${tw`text-xs text-green-600 dark:text-green-400 font-mono bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-600`}
`;

export const MobileErrorMessage = styled.div`
  ${tw`flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/20`}
`;

export const MobileErrorHelp = styled.div`
  ${tw`mt-1 text-xs text-red-500 dark:text-red-300`}

  code {
    ${tw`bg-red-900/20 px-1 py-0.5 rounded font-mono text-xs`}
  }
`;

export const MobileActions = styled.div`
  ${tw`flex gap-2`}
`;

// Mobile screenshot styles
export const MobileScreenshotGrid = styled.div`
  ${tw`grid grid-cols-3 gap-2 mb-3`}
`;

export const MobileScreenshotItem = styled.div`
  ${tw`relative rounded-lg overflow-hidden border border-border`}
`;

export const MobileScreenshotImage = styled.img`
  ${tw`w-full h-20 object-cover`}
`;

export const MobileRemoveButton = styled.button`
  ${tw`absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center`}
`;

export const MobileScreenshotActions = styled.div`
  ${tw`flex gap-2`}
`;

export const SafeArea = styled.div`
  ${tw`h-4`}
`;
