// QuickSettingsPanel.jsx
import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings2,
  Moon,
  Sun,
  Maximize2,
  Eye,
  ArrowDown,
  Mic,
  Sparkles,
  FileText
} from 'lucide-react';
import { ThemeToggle } from '@/shared-components/ThemeToggle';
import { useQuickSettingsPanel } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel.hook';
import { WHISPER_MODES, WHISPER_MODE_CONFIG } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel.logic';
import {
  PullTabContainer,
  PullTabButton,
  TabIcon,
  PanelContainer,
  PanelContent,
  PanelHeader,
  PanelTitle,
  HeaderIcon,
  SettingsContent,
  SettingSection,
  SectionTitle,
  SettingItem,
  RadioSettingItem,
  SettingLabel,
  SettingIcon,
  Checkbox,
  RadioButton,
  RadioContent,
  RadioLabel,
  RadioDescription,
  Backdrop
} from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel.styles';

// Sub-components
const PullTab = ({ isOpen, onToggle, isMobile }) => (
  <PullTabContainer isOpen={isOpen} isMobile={isMobile}>
    <PullTabButton
      onClick={onToggle}
      aria-label={isOpen ? 'Close settings panel' : 'Open settings panel'}
    >
      <TabIcon as={isOpen ? ChevronRight : ChevronLeft} />
    </PullTabButton>
  </PullTabContainer>
);

const AppearanceSection = ({ isDarkMode }) => (
  <SettingSection>
    <SectionTitle>Appearance</SectionTitle>
    <SettingItem>
      <SettingLabel>
        <SettingIcon as={isDarkMode ? Moon : Sun} />
        Dark Mode
      </SettingLabel>
      <ThemeToggle />
    </SettingItem>
  </SettingSection>
);

const ToolDisplaySection = ({ settings, onAutoExpandChange, onShowRawParametersChange }) => (
  <SettingSection>
    <SectionTitle>Tool Display</SectionTitle>
    <SettingItem>
      <SettingLabel>
        <SettingIcon as={Maximize2} />
        Auto-expand tools
      </SettingLabel>
      <Checkbox
        type="checkbox"
        checked={settings.autoExpandTools}
        onChange={(e) => onAutoExpandChange(e.target.checked)}
      />
    </SettingItem>
    <SettingItem>
      <SettingLabel>
        <SettingIcon as={Eye} />
        Show raw parameters
      </SettingLabel>
      <Checkbox
        type="checkbox"
        checked={settings.showRawParameters}
        onChange={(e) => onShowRawParametersChange(e.target.checked)}
      />
    </SettingItem>
  </SettingSection>
);

const ViewOptionsSection = ({ settings, onAutoScrollChange }) => (
  <SettingSection>
    <SectionTitle>View Options</SectionTitle>
    <SettingItem>
      <SettingLabel>
        <SettingIcon as={ArrowDown} />
        Auto-scroll to bottom
      </SettingLabel>
      <Checkbox
        type="checkbox"
        checked={settings.autoScrollToBottom}
        onChange={(e) => onAutoScrollChange(e.target.checked)}
      />
    </SettingItem>
  </SettingSection>
);

const WhisperModeOption = ({ mode, config, isChecked, onChange }) => {
  const iconMap = {
    Mic: Mic,
    Sparkles: Sparkles,
    FileText: FileText
  };
  const Icon = iconMap[config.icon];

  return (
    <RadioSettingItem>
      <RadioButton
        type="radio"
        name="whisperMode"
        value={mode}
        checked={isChecked}
        onChange={() => onChange(mode)}
      />
      <RadioContent>
        <RadioLabel>
          <SettingIcon as={Icon} />
          {config.label}
        </RadioLabel>
        <RadioDescription>
          {config.description}
        </RadioDescription>
      </RadioContent>
    </RadioSettingItem>
  );
};

const WhisperDictationSection = ({ whisperMode, onWhisperModeChange }) => (
  <SettingSection>
    <SectionTitle>Whisper Dictation</SectionTitle>
    <div className="space-y-2">
      {Object.entries(WHISPER_MODE_CONFIG).map(([mode, config]) => (
        <WhisperModeOption
          key={mode}
          mode={mode}
          config={config}
          isChecked={whisperMode === mode}
          onChange={onWhisperModeChange}
        />
      ))}
    </div>
  </SettingSection>
);

/**
 * QuickSettingsPanel Component
 * 
 * A slide-out settings panel that provides quick access to appearance and behavior settings.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls whether the panel is open or closed
 * @param {Function} props.onToggle - Callback when the panel is toggled
 * @param {boolean} props.autoExpandTools - Whether tools should auto-expand
 * @param {Function} props.onAutoExpandChange - Callback when auto-expand setting changes
 * @param {boolean} props.showRawParameters - Whether to show raw parameters
 * @param {Function} props.onShowRawParametersChange - Callback when show raw parameters setting changes
 * @param {boolean} props.autoScrollToBottom - Whether to auto-scroll to bottom
 * @param {Function} props.onAutoScrollChange - Callback when auto-scroll setting changes
 * @param {boolean} props.isMobile - Whether the panel is in mobile mode
 */
export const QuickSettingsPanel = (props) => {
  const {
    localIsOpen,
    whisperMode,
    isDarkMode,
    handleToggle,
    handleWhisperModeChange,
    handleAutoExpandChange,
    handleShowRawParametersChange,
    handleAutoScrollChange,
    settings
  } = useQuickSettingsPanel(props);

  return (
    <>
      <PullTab 
        isOpen={localIsOpen} 
        onToggle={handleToggle} 
        isMobile={props.isMobile} 
      />

      <PanelContainer isOpen={localIsOpen} isMobile={props.isMobile}>
        <PanelContent>
          <PanelHeader>
            <PanelTitle>
              <HeaderIcon as={Settings2} />
              Quick Settings
            </PanelTitle>
          </PanelHeader>

          <SettingsContent isMobile={props.isMobile}>
            <AppearanceSection isDarkMode={isDarkMode} />
            
            <ToolDisplaySection 
              settings={settings}
              onAutoExpandChange={handleAutoExpandChange}
              onShowRawParametersChange={handleShowRawParametersChange}
            />
            
            <ViewOptionsSection 
              settings={settings}
              onAutoScrollChange={handleAutoScrollChange}
            />
            
            <WhisperDictationSection 
              whisperMode={whisperMode}
              onWhisperModeChange={handleWhisperModeChange}
            />
          </SettingsContent>
        </PanelContent>
      </PanelContainer>

      {localIsOpen && (
        <Backdrop onClick={handleToggle} />
      )}
    </>
  );
};