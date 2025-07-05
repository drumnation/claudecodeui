import React from 'react';
import { CommitMessage } from '@/features/git/CommitMessage/CommitMessage';

export default {
  title: 'Features/Git/CommitMessage',
  component: CommitMessage,
  parameters: {
    layout: 'padded',
  },
};

const Template = (args) => (
  <div style={{ width: '100%', maxWidth: '600px' }}>
    <CommitMessage {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  commitMessage: '',
  onCommitMessageChange: (message) => console.log('Message changed:', message),
  onGenerateMessage: () => console.log('Generate message'),
  onCommit: () => console.log('Commit'),
  onTranscript: (transcript) => console.log('Transcript:', transcript),
  selectedFilesCount: 3,
  isCommitting: false,
  isGeneratingMessage: false,
};

export const WithMessage = Template.bind({});
WithMessage.args = {
  ...Default.args,
  commitMessage: 'feat: add new feature to improve user experience',
};

export const Committing = Template.bind({});
Committing.args = {
  ...Default.args,
  commitMessage: 'fix: resolve critical bug in authentication',
  isCommitting: true,
};

export const GeneratingMessage = Template.bind({});
GeneratingMessage.args = {
  ...Default.args,
  isGeneratingMessage: true,
};

export const NoFilesSelected = Template.bind({});
NoFilesSelected.args = {
  ...Default.args,
  selectedFilesCount: 0,
};