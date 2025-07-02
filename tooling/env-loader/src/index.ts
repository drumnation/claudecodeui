/**
 * @kit/env-loader
 *
 * Centralized environment variable loader for monorepo applications.
 *
 * This package provides separate exports for Node.js and browser environments:
 * - Use '@kit/env-loader/node' for Node.js applications (backend, CLI tools)
 * - Use '@kit/env-loader/browser' for browser applications (frontend)
 *
 * The default export is the Node.js version for backward compatibility.
 */

// Re-export everything from node as the default
export * from './node';

// Also export node and browser namespaces
import * as node from './node';
import * as browser from './browser';

export {node, browser};
