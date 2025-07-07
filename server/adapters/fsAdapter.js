/**
 * File system adapter to centralize all file operations
 * This makes the code more testable by allowing easy mocking
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');

class FSAdapter {
  /**
   * Read a file as text
   * @param {string} filePath - Path to the file
   * @param {string} encoding - File encoding (default: utf8)
   * @returns {Promise<string>} File content
   */
  async readFile(filePath, encoding = 'utf8') {
    return fs.readFile(filePath, encoding);
  }

  /**
   * Write text to a file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   * @param {string} encoding - File encoding (default: utf8)
   * @returns {Promise<void>}
   */
  async writeFile(filePath, content, encoding = 'utf8') {
    return fs.writeFile(filePath, content, encoding);
  }

  /**
   * Read a JSON file
   * @param {string} filePath - Path to the JSON file
   * @returns {Promise<any>} Parsed JSON content
   */
  async readJSON(filePath) {
    const content = await this.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Write JSON to a file
   * @param {string} filePath - Path to the file
   * @param {any} data - Data to write
   * @param {number} indent - JSON indentation (default: 2)
   * @returns {Promise<void>}
   */
  async writeJSON(filePath, data, indent = 2) {
    const content = JSON.stringify(data, null, indent);
    return this.writeFile(filePath, content, 'utf8');
  }

  /**
   * Read a JSONL file
   * @param {string} filePath - Path to the JSONL file
   * @returns {Promise<Array>} Array of parsed objects
   */
  async readJSONL(filePath) {
    const content = await this.readFile(filePath, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error(`Failed to parse JSONL line: ${line}`);
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Write JSONL to a file
   * @param {string} filePath - Path to the file
   * @param {Array} data - Array of objects to write
   * @returns {Promise<void>}
   */
  async writeJSONL(filePath, data) {
    const content = data
      .map(item => JSON.stringify(item))
      .join('\n');
    return this.writeFile(filePath, content, 'utf8');
  }

  /**
   * Append to a JSONL file
   * @param {string} filePath - Path to the file
   * @param {Object} item - Object to append
   * @returns {Promise<void>}
   */
  async appendJSONL(filePath, item) {
    const line = JSON.stringify(item) + '\n';
    return fs.appendFile(filePath, line, 'utf8');
  }

  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file or directory stats
   * @param {string} filePath - Path to stat
   * @returns {Promise<import('fs').Stats>} File stats
   */
  async stat(filePath) {
    return fs.stat(filePath);
  }

  /**
   * Create a directory
   * @param {string} dirPath - Directory path
   * @param {Object} options - mkdir options
   * @returns {Promise<void>}
   */
  async mkdir(dirPath, options = { recursive: true }) {
    return fs.mkdir(dirPath, options);
  }

  /**
   * Read a directory
   * @param {string} dirPath - Directory path
   * @returns {Promise<string[]>} Array of filenames
   */
  async readdir(dirPath) {
    return fs.readdir(dirPath);
  }

  /**
   * Remove a file or directory
   * @param {string} filePath - Path to remove
   * @param {Object} options - rm options
   * @returns {Promise<void>}
   */
  async remove(filePath, options = { recursive: true, force: true }) {
    return fs.rm(filePath, options);
  }

  /**
   * Copy a file
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   * @returns {Promise<void>}
   */
  async copyFile(src, dest) {
    return fs.copyFile(src, dest);
  }

  /**
   * Move/rename a file or directory
   * @param {string} oldPath - Current path
   * @param {string} newPath - New path
   * @returns {Promise<void>}
   */
  async rename(oldPath, newPath) {
    return fs.rename(oldPath, newPath);
  }

  /**
   * Ensure a directory exists
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   */
  async ensureDir(dirPath) {
    if (!(await this.exists(dirPath))) {
      await this.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Read file if exists, otherwise return default value
   * @param {string} filePath - Path to the file
   * @param {any} defaultValue - Default value if file doesn't exist
   * @returns {Promise<string>} File content or default
   */
  async readFileOrDefault(filePath, defaultValue = '') {
    try {
      return await this.readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Read JSON file if exists, otherwise return default value
   * @param {string} filePath - Path to the JSON file
   * @param {any} defaultValue - Default value if file doesn't exist
   * @returns {Promise<any>} Parsed JSON or default
   */
  async readJSONOrDefault(filePath, defaultValue = {}) {
    try {
      return await this.readJSON(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Create a read stream
   * @param {string} filePath - Path to the file
   * @param {Object} options - Stream options
   * @returns {ReadStream} Read stream
   */
  createReadStream(filePath, options) {
    return createReadStream(filePath, options);
  }

  /**
   * Create a write stream
   * @param {string} filePath - Path to the file
   * @param {Object} options - Stream options
   * @returns {WriteStream} Write stream
   */
  createWriteStream(filePath, options) {
    return createWriteStream(filePath, options);
  }

  /**
   * Get the real path of a file (resolving symlinks)
   * @param {string} filePath - Path to resolve
   * @returns {Promise<string>} Real path
   */
  async realpath(filePath) {
    return fs.realpath(filePath);
  }

  /**
   * Walk a directory tree
   * @param {string} dir - Directory to walk
   * @param {Function} callback - Callback for each file
   * @returns {Promise<void>}
   */
  async walk(dir, callback) {
    const files = await this.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await this.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.walk(filePath, callback);
      } else {
        await callback(filePath, stat);
      }
    }
  }
}

// Export singleton instance
module.exports = new FSAdapter();