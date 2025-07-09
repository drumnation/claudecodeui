// import {FullConfig} from '@playwright/test';
import {createLogger} from '@kit/logger/node';
import fs from 'fs';
import path from 'path';

const logger = createLogger({scope: 'playwright-teardown'});

async function globalTeardown(_config: any) {
  logger.info('Starting global teardown for Playwright tests');

  try {
    // Clean up test artifacts
    const testResultsDir = path.join(process.cwd(), 'test-results');

    if (fs.existsSync(testResultsDir)) {
      // Archive old results
      const archiveDir = path.join(testResultsDir, 'archive');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, {recursive: true});
      }

      // Move screenshots to archive
      const screenshotsDir = path.join(testResultsDir, 'screenshots');
      if (fs.existsSync(screenshotsDir)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveScreenshotsDir = path.join(
          archiveDir,
          `screenshots-${timestamp}`,
        );
        fs.renameSync(screenshotsDir, archiveScreenshotsDir);
        logger.info(`Archived screenshots to ${archiveScreenshotsDir}`);
      }
    }

    // Generate test summary
    const summaryFile = path.join(testResultsDir, 'test-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      message: 'Playwright tests completed successfully',
      artifacts: {
        screenshots: fs.existsSync(path.join(testResultsDir, 'screenshots')),
        videos: fs.existsSync(path.join(testResultsDir, 'videos')),
        traces: fs.existsSync(path.join(testResultsDir, 'traces')),
        reports: fs.existsSync(
          path.join(testResultsDir, 'playwright-html-report'),
        ),
      },
    };

    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    logger.info(`Test summary written to ${summaryFile}`);

    // Clean up temporary files
    const tempFiles = ['playwright-report', 'test-results/.tmp'];

    for (const tempFile of tempFiles) {
      const tempPath = path.join(process.cwd(), tempFile);
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, {recursive: true, force: true});
        logger.info(`Cleaned up temporary file: ${tempPath}`);
      }
    }

    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error(`Global teardown failed: ${(error as Error).message}`);
    // Don't throw here - teardown failures shouldn't fail the tests
  }
}

export default globalTeardown;
