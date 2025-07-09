#!/usr/bin/env node
import {exec} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';

const BUILD_DIR = 'dist';
const REPORT_FILE = 'bundle-analysis.json';

async function analyzeBundle() {
  console.log('🔍 Analyzing bundle size...');

  try {
    // Build the app first
    console.log('📦 Building application...');
    await execAsync('npm run build');

    // Get all chunk files
    const distPath = path.resolve(BUILD_DIR);
    const files = await fs.readdir(distPath);
    const jsFiles = files.filter((file) => file.endsWith('.js'));
    const cssFiles = files.filter((file) => file.endsWith('.css'));

    const analysis = {
      timestamp: new Date().toISOString(),
      chunks: {},
      totalSize: 0,
      recommendations: [],
    };

    // Analyze each JS chunk
    for (const file of jsFiles) {
      const filePath = path.join(distPath, file);
      const stats = await fs.stat(filePath);
      const sizeKB = Math.round(stats.size / 1024);

      analysis.chunks[file] = {
        size: sizeKB,
        type: 'javascript',
        gzipped: await getGzippedSize(filePath),
      };

      analysis.totalSize += sizeKB;

      // Add recommendations for large chunks
      if (sizeKB > 500) {
        analysis.recommendations.push({
          type: 'warning',
          message: `Large chunk detected: ${file} (${sizeKB}KB). Consider code splitting.`,
        });
      }
    }

    // Analyze CSS files
    for (const file of cssFiles) {
      const filePath = path.join(distPath, file);
      const stats = await fs.stat(filePath);
      const sizeKB = Math.round(stats.size / 1024);

      analysis.chunks[file] = {
        size: sizeKB,
        type: 'css',
        gzipped: await getGzippedSize(filePath),
      };

      analysis.totalSize += sizeKB;
    }

    // Generate recommendations
    if (analysis.totalSize > 2000) {
      analysis.recommendations.push({
        type: 'error',
        message: `Bundle size is ${analysis.totalSize}KB. Consider aggressive code splitting.`,
      });
    } else if (analysis.totalSize > 1000) {
      analysis.recommendations.push({
        type: 'warning',
        message: `Bundle size is ${analysis.totalSize}KB. Monitor for further growth.`,
      });
    } else {
      analysis.recommendations.push({
        type: 'success',
        message: `Bundle size is ${analysis.totalSize}KB. Good job!`,
      });
    }

    // Save analysis
    await fs.writeFile(REPORT_FILE, JSON.stringify(analysis, null, 2));

    // Print summary
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`Total size: ${analysis.totalSize}KB`);
    console.log(`Chunks: ${Object.keys(analysis.chunks).length}`);

    console.log('\n📋 Chunks by size:');
    const sortedChunks = Object.entries(analysis.chunks)
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 10);

    sortedChunks.forEach(([name, info]) => {
      console.log(`  ${name}: ${info.size}KB (${info.gzipped}KB gzipped)`);
    });

    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec) => {
      const icon =
        rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : '✅';
      console.log(`  ${icon} ${rec.message}`);
    });

    console.log(`\n📄 Full report saved to ${REPORT_FILE}`);
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

async function getGzippedSize(filePath) {
  try {
    const {stdout} = await execAsync(`gzip -c "${filePath}" | wc -c`);
    return Math.round(parseInt(stdout.trim()) / 1024);
  } catch {
    return 0;
  }
}

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}

// Run analysis
analyzeBundle();
