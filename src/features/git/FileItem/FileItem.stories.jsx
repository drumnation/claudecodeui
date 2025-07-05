import React from 'react';
import { FileItem } from '@/features/git/FileItem/FileItem';

export default {
  title: 'Features/Git/FileItem',
  component: FileItem,
  parameters: {
    layout: 'padded',
  },
};

const mockDiff = `diff --git a/src/components/Header.jsx b/src/components/Header.jsx
index 1234567..abcdefg 100644
--- a/src/components/Header.jsx
+++ b/src/components/Header.jsx
@@ -10,7 +10,7 @@ export const Header = () => {
   return (
     <header className="header">
-      <h1>Old Title</h1>
+      <h1>New Title</h1>
       <nav>
         <ul>
@@ -20,6 +20,8 @@ export const Header = () => {
           <li>Contact</li>
         </ul>
       </nav>
+      <button>Sign In</button>
+      <button>Sign Up</button>
     </header>
   );
 };`;

const Template = (args) => (
  <div style={{ width: '100%', maxWidth: '800px', border: '1px solid #e5e7eb' }}>
    <FileItem {...args} />
  </div>
);

export const Modified = Template.bind({});
Modified.args = {
  filePath: 'src/components/Header.jsx',
  status: 'M',
  diff: mockDiff,
  isExpanded: false,
  isSelected: true,
  isMobile: false,
  wrapText: false,
  onToggleExpanded: () => console.log('Toggle expanded'),
  onToggleSelected: () => console.log('Toggle selected'),
  onToggleWrapText: () => console.log('Toggle wrap text'),
};

export const Added = Template.bind({});
Added.args = {
  ...Modified.args,
  filePath: 'src/components/NewComponent.jsx',
  status: 'A',
};

export const Deleted = Template.bind({});
Deleted.args = {
  ...Modified.args,
  filePath: 'src/components/OldComponent.jsx',
  status: 'D',
  isSelected: false,
};

export const Untracked = Template.bind({});
Untracked.args = {
  ...Modified.args,
  filePath: 'src/utils/helpers.js',
  status: 'U',
  diff: null,
};

export const Expanded = Template.bind({});
Expanded.args = {
  ...Modified.args,
  isExpanded: true,
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Modified.args,
  isMobile: true,
  isExpanded: true,
};

export const MobileWithWrap = Template.bind({});
MobileWithWrap.args = {
  ...MobileView.args,
  wrapText: true,
};