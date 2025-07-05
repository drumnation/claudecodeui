import React, { useState, useRef } from 'react';
import InputArea from '@/features/chat/components/InputArea/InputArea/InputArea';

export default {
  title: 'Features/Chat/Components/InputArea',
  component: InputArea,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  const [input, setInput] = useState(args.input || '');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const [slashPosition, setSlashPosition] = useState(-1);
  const textareaRef = useRef(null);
  
  const mockFiles = [
    { name: 'App.jsx', path: '/src/App.jsx' },
    { name: 'index.js', path: '/src/index.js' },
    { name: 'Button.jsx', path: '/src/components/Button.jsx' },
    { name: 'Header.jsx', path: '/src/components/Header.jsx' },
    { name: 'Footer.jsx', path: '/src/components/Footer.jsx' },
  ];
  
  const mockCommands = [
    { name: 'help', description: 'Show available commands' },
    { name: 'clear', description: 'Clear the conversation' },
    { name: 'settings', description: 'Open settings' },
    { name: 'export', description: 'Export conversation' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', input);
    setInput('');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    setCursorPosition(e.target.selectionStart);
    
    // Check for @ mentions
    const beforeCursor = newValue.substring(0, e.target.selectionStart);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && !beforeCursor.substring(lastAtIndex).includes(' ')) {
      const query = beforeCursor.substring(lastAtIndex + 1);
      const filtered = mockFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.path.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filtered);
      setShowFileDropdown(filtered.length > 0);
      setSelectedFileIndex(filtered.length > 0 ? 0 : -1);
      setAtSymbolPosition(lastAtIndex);
    } else {
      setShowFileDropdown(false);
    }
    
    // Check for / commands
    if (beforeCursor.startsWith('/') && !beforeCursor.includes(' ')) {
      const command = beforeCursor.substring(1);
      const filtered = mockCommands.filter(cmd =>
        cmd.name.toLowerCase().includes(command.toLowerCase())
      );
      setFilteredCommands(filtered);
      setShowCommandMenu(filtered.length > 0);
      setSelectedCommandIndex(filtered.length > 0 ? 0 : -1);
      setSlashPosition(0);
    } else {
      setShowCommandMenu(false);
    }
  };

  const handleTextareaClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTranscript = (transcript) => {
    console.log('Transcript:', transcript);
    setInput(prev => prev + ' ' + transcript);
  };

  const handleAbortSession = () => {
    console.log('Abort session');
  };

  const selectCommand = (command) => {
    const newInput = `/${command.name} `;
    setInput(newInput);
    setShowCommandMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const selectFile = (file) => {
    const beforeAt = input.substring(0, atSymbolPosition);
    const afterCursor = input.substring(cursorPosition);
    const newInput = beforeAt + `@${file.path} ` + afterCursor;
    setInput(newInput);
    setShowFileDropdown(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: '#f3f4f6' }}>
      <div style={{ flex: 1 }} />
      <InputArea
        {...args}
        input={input}
        setInput={setInput}
        isInputFocused={isInputFocused}
        setIsInputFocused={setIsInputFocused}
        isTextareaExpanded={isTextareaExpanded}
        setIsTextareaExpanded={setIsTextareaExpanded}
        showCommandMenu={showCommandMenu}
        setShowCommandMenu={setShowCommandMenu}
        filteredCommands={filteredCommands}
        setFilteredCommands={setFilteredCommands}
        showFileDropdown={showFileDropdown}
        setShowFileDropdown={setShowFileDropdown}
        filteredFiles={filteredFiles}
        setFilteredFiles={setFilteredFiles}
        selectedFileIndex={selectedFileIndex}
        setSelectedFileIndex={setSelectedFileIndex}
        selectedCommandIndex={selectedCommandIndex}
        setSelectedCommandIndex={setSelectedCommandIndex}
        textareaRef={textareaRef}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleTextareaClick={handleTextareaClick}
        handleKeyDown={handleKeyDown}
        handleTranscript={handleTranscript}
        handleAbortSession={handleAbortSession}
        selectCommand={selectCommand}
        selectFile={selectFile}
        setCursorPosition={setCursorPosition}
        fileList={mockFiles}
        slashCommands={mockCommands}
        cursorPosition={cursorPosition}
        atSymbolPosition={atSymbolPosition}
        setAtSymbolPosition={setAtSymbolPosition}
        slashPosition={slashPosition}
        setSlashPosition={setSlashPosition}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  isLoading: false,
  claudeStatus: null,
};

export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
  claudeStatus: { status: 'working', message: 'Thinking...' },
};

export const WithInput = Template.bind({});
WithInput.args = {
  input: 'Can you help me with React hooks?',
  isLoading: false,
  claudeStatus: null,
};

export const MultilineInput = Template.bind({});
MultilineInput.args = {
  input: 'Can you help me with the following code?\n\nfunction MyComponent() {\n  // Need help here\n}',
  isLoading: false,
  claudeStatus: null,
};

export const WithClaudeStatus = Template.bind({});
WithClaudeStatus.args = {
  isLoading: true,
  claudeStatus: {
    status: 'working',
    message: 'Reading file: /src/components/App.jsx',
  },
};

export const MobileView = Template.bind({});
MobileView.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};
MobileView.args = {
  isLoading: false,
  claudeStatus: null,
};

export const DarkMode = Template.bind({});
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
};
DarkMode.decorators = [
  (Story) => (
    <div className="dark" style={{ minHeight: '100vh', backgroundColor: '#1f2937' }}>
      <Story />
    </div>
  ),
];
DarkMode.args = {
  isLoading: false,
  claudeStatus: null,
};