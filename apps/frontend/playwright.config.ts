import {configs} from '@kit/testing';

// Browser E2E tests for frontend app
const config = await configs.playwright.browser();

export default config;
