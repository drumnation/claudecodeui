import React from 'react';
import { Footer, FooterLeft, FooterRight } from '@/shared-components/CodeEditor/components/EditorFooter/EditorFooter.styles';
import { getFileInfo } from '@/shared-components/CodeEditor/CodeEditor.logic';

export const EditorFooter = ({ file, content }) => {
  const { extension, lineCount, charCount } = getFileInfo(file);
  
  return (
    <Footer>
      <FooterLeft>
        <span>Lines: {lineCount(content)}</span>
        <span>Characters: {charCount(content)}</span>
        <span>Language: {extension}</span>
      </FooterLeft>
      
      <FooterRight>
        Press Ctrl+S to save • Esc to close
      </FooterRight>
    </Footer>
  );
};