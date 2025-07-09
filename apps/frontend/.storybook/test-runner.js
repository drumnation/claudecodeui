/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  setup() {
    // Add any global setup here
  },
  async preVisit(page) {
    // Add any pre-visit setup here
    await page.setViewportSize({width: 1920, height: 1080});
  },
  async postVisit(page, _context) {
    // Add any post-visit checks here
    const elementHandler = await page.$('#storybook-root [data-testid]');
    if (elementHandler) {
      await elementHandler.dispose();
    }
  },
  tags: {
    include: ['test'],
    exclude: ['docs-only'],
    skip: ['skip-test'],
  },
  // Configure test behavior
  testTimeout: 60000,
  browserLaunchOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};

export default config;
