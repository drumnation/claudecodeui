

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config) {
    // Ensure Storybook uses the same Vite plugins as the main app
    const { default: macrosPlugin } = await import('vite-plugin-babel-macros');
    
    // Add babel macros plugin if not already present
    if (!config.plugins.find(plugin => plugin.name === 'vite-plugin-babel-macros')) {
      config.plugins.push(macrosPlugin());
    }
    
    return config;
  }
};
export default config;