import React from 'react'
import type { Preview } from '@storybook/react-vite'
import { LoggerProvider } from '@kit/logger/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <LoggerProvider scope="storybook" level="debug">
        <Story />
      </LoggerProvider>
    ),
  ],
};

export default preview;