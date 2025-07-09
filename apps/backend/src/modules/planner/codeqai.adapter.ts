import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { 
  CodeContext, 
  CodeQAISearchOptions, 
  CodeQAISearchResult, 
  AgentType 
} from './planner.types.js';

export class CodeQAIAdapter {
  private codeqaiBinary: string;
  private resultCache: Map<string, CodeQAISearchResult>;
  
  constructor() {
    this.codeqaiBinary = process.env.CODEQAI_BINARY || 'codeqai';
    this.resultCache = new Map();
  }

  async ensureIndexed(projectPath: string): Promise<boolean> {
    try {
      // Check if .codeqai directory exists
      const codeqaiDir = path.join(projectPath, '.codeqai');
      await fs.access(codeqaiDir);
      return true;
    } catch (error) {
      console.warn('CodeQAI index not found, attempting to create...');
      try {
        await this.executeCodeQAICommand(projectPath, ['index', '.']);
        return true;
      } catch (indexError) {
        console.error('Failed to create CodeQAI index:', indexError);
        return false;
      }
    }
  }

  async search(
    projectPath: string, 
    query: string, 
    options: CodeQAISearchOptions = {}
  ): Promise<CodeQAISearchResult> {
    const cacheKey = `${projectPath}:${query}:${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.resultCache.has(cacheKey)) {
      const cached = this.resultCache.get(cacheKey)!;
      // Cache for 5 minutes
      if (Date.now() - cached.searchTime < 300000) {
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      // Ensure project is indexed
      const isIndexed = await this.ensureIndexed(projectPath);
      if (!isIndexed) {
        return {
          query,
          results: [],
          totalResults: 0,
          searchTime: Date.now() - startTime
        };
      }

      const searchArgs = ['search', query];
      
      // Add options to search command
      if (options.maxResults) {
        searchArgs.push('--limit', String(options.maxResults));
      }
      
      if (options.fileTypes && options.fileTypes.length > 0) {
        searchArgs.push('--file-types', options.fileTypes.join(','));
      }

      const output = await this.executeCodeQAICommand(projectPath, searchArgs);
      const results = this.parseSearchResults(output, options);
      
      const searchResult: CodeQAISearchResult = {
        query,
        results,
        totalResults: results.length,
        searchTime: Date.now() - startTime
      };

      // Cache the result
      this.resultCache.set(cacheKey, searchResult);
      
      return searchResult;
    } catch (error: any) {
      console.error('CodeQAI search failed:', error);
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime
      };
    }
  }

  getAgentQueries(agentType: AgentType, featureDescription: string): string[] {
    // Extract key terms from feature description for more targeted searches
    const featureKeywords = this.extractKeywords(featureDescription);
    
    switch (agentType) {
      case AgentType.ARCH:
        return [
          // Core architecture queries
          'main architectural modules',
          'core services',
          'entry points index main app',
          'configuration files config settings',
          'routing patterns routes router',
          'database models schema migrations',
          'API endpoints controllers handlers',
          'state management store redux context',
          'authentication auth session',
          'middleware interceptors guards',
          'websocket socket realtime',
          'event emitter bus messaging',
          // Feature-specific architectural queries
          ...featureKeywords.map(keyword => `architecture ${keyword}`),
          ...featureKeywords.map(keyword => `${keyword} service module component`)
        ];
      
      case AgentType.DIFF:
        return [
          // Direct feature searches
          ...featureKeywords.map(keyword => `${keyword}`),
          `files related to ${featureDescription}`,
          // Component and module searches
          'component tsx jsx',
          'service module class',
          'controller handler route',
          'hook custom use',
          'util helper function',
          // UI/UX related
          'modal dialog form',
          'button action trigger',
          'style css styled emotion',
          // Testing
          'test spec suite describe it',
          'mock stub spy',
          // Recent changes context
          'TODO FIXME NOTE',
          'recent modified updated'
        ];
      
      case AgentType.DEPS:
        return [
          // Package management
          'package.json dependencies',
          'requirements.txt pip',
          'go.mod go.sum',
          'cargo.toml',
          // Import analysis
          'import from require',
          'external dependencies',
          'node_modules vendor',
          // Library usage
          ...featureKeywords.map(keyword => `import ${keyword}`),
          'utility functions utils helpers',
          'shared common lib',
          // API and SDK usage
          'client sdk api',
          'fetch axios http request',
          // Build and tooling
          'webpack vite rollup',
          'babel typescript tsconfig',
          'eslint prettier lint'
        ];
      
      default:
        return ['code structure', 'main files', ...featureKeywords];
    }
  }
  
  private extractKeywords(description: string): string[] {
    // Extract meaningful keywords from the feature description
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'how', 'when', 'where', 'why', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall']);
    
    const words = description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .split(/\s+/)              // Split by whitespace
      .filter(word => word.length > 2 && !stopWords.has(word)); // Filter short words and stop words
    
    // Return unique keywords
    return [...new Set(words)];
  }

  async getAgentContext(
    projectPath: string, 
    agentType: AgentType, 
    featureDescription: string,
    options: CodeQAISearchOptions = {}
  ): Promise<CodeContext[]> {
    const queries = this.getAgentQueries(agentType, featureDescription);
    const allResults: CodeContext[] = [];
    
    for (const query of queries) {
      const searchResult = await this.search(projectPath, query, {
        maxResults: options.maxResults || 5, // Increased from 3
        contextLength: options.contextLength || 1000, // Increased from 500
        ...options
      });
      
      allResults.push(...searchResult.results);
    }
    
    // Deduplicate by file path and sort by relevance
    const uniqueResults = this.deduplicateResults(allResults);
    
    // Limit total results
    const maxResults = options.maxResults || 10;
    return uniqueResults.slice(0, maxResults);
  }

  private executeCodeQAICommand(projectPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const codeqaiProcess = spawn(this.codeqaiBinary, args, {
        cwd: projectPath,
        env: { ...process.env }
      });
      
      let output = '';
      let errorOutput = '';
      
      codeqaiProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      codeqaiProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      codeqaiProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`CodeQAI process exited with code ${code}: ${errorOutput}`));
        } else {
          resolve(output);
        }
      });
      
      codeqaiProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseSearchResults(output: string, options: CodeQAISearchOptions): CodeContext[] {
    const results: CodeContext[] = [];
    
    try {
      // CodeQAI typically outputs in a structured format
      // Parse the plain text output looking for file paths and code snippets
      const lines = output.split('\n');
      let currentFile = '';
      let currentSnippet = '';
      let currentLineNumber = 0;
      let currentRelevance = 1.0;
      
      for (const line of lines) {
        // Look for file path patterns
        const fileMatch = line.match(/^(.+\.(ts|js|tsx|jsx|py|java|cpp|c|go|rs|php|rb|swift|kt|scala|clj|sh|md|yml|yaml|json|xml|html|css|scss|sass|less|sql)):?(\d+)?/);
        if (fileMatch) {
          // Save previous result if we have one
          if (currentFile && currentSnippet.trim()) {
            results.push({
              file: currentFile,
              snippet: this.truncateSnippet(currentSnippet, options.contextLength || 500),
              relevance: currentRelevance,
              lineNumber: currentLineNumber
            });
          }
          
          currentFile = fileMatch[1];
          currentLineNumber = parseInt(fileMatch[3] || '0', 10);
          currentSnippet = '';
          currentRelevance = 1.0;
          continue;
        }
        
        // Look for relevance scores
        const relevanceMatch = line.match(/relevance[:\s]+(\d+(?:\.\d+)?)/i);
        if (relevanceMatch) {
          currentRelevance = parseFloat(relevanceMatch[1]);
          continue;
        }
        
        // Accumulate code snippet
        if (currentFile && line.trim()) {
          currentSnippet += line + '\n';
        }
      }
      
      // Add the last result
      if (currentFile && currentSnippet.trim()) {
        results.push({
          file: currentFile,
          snippet: this.truncateSnippet(currentSnippet, options.contextLength || 500),
          relevance: currentRelevance,
          lineNumber: currentLineNumber
        });
      }
      
      // If no structured output found, try to extract from simpler format
      if (results.length === 0) {
        const simpleMatches = output.match(/([^\n]+\.(ts|js|tsx|jsx|py|java|cpp|c|go|rs|php|rb|swift|kt|scala|clj|sh|md|yml|yaml|json|xml|html|css|scss|sass|less|sql))/g);
        if (simpleMatches) {
          for (const match of simpleMatches) {
            results.push({
              file: match.trim(),
              snippet: 'File found in codebase',
              relevance: 0.5,
              lineNumber: 0
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to parse CodeQAI output:', error);
    }
    
    return results;
  }

  private deduplicateResults(results: CodeContext[]): CodeContext[] {
    const seen = new Set<string>();
    const unique: CodeContext[] = [];
    
    for (const result of results) {
      const key = `${result.file}:${result.lineNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }
    
    // Sort by relevance descending
    return unique.sort((a, b) => b.relevance - a.relevance);
  }

  private truncateSnippet(snippet: string, maxLength: number): string {
    if (snippet.length <= maxLength) {
      return snippet;
    }
    
    return snippet.substring(0, maxLength) + '...';
  }

  // Clear cache periodically
  public clearCache(): void {
    this.resultCache.clear();
  }

  // Interactive chat with codebase
  async chat(projectPath: string, question: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Ensure project is indexed
      const isIndexed = await this.ensureIndexed(projectPath);
      if (!isIndexed) {
        throw new Error('Failed to index project with CodeQAI');
      }

      // Execute chat command with single response flag
      const output = await this.executeCodeQAICommand(projectPath, [
        'chat',
        question,
        '--single'  // Get single response instead of interactive mode
      ]);
      
      console.log(`CodeQAI chat response in ${Date.now() - startTime}ms`);
      return output.trim();
    } catch (error: any) {
      console.error('CodeQAI chat failed:', error);
      throw new Error(`CodeQAI chat failed: ${error.message}`);
    }
  }

  // Sync the CodeQAI index
  async syncIndex(projectPath: string, incremental: boolean = true): Promise<void> {
    try {
      console.log(`Syncing CodeQAI index for ${projectPath}...`);
      const args = ['sync'];
      if (incremental) {
        args.push('--incremental');
      }
      
      await this.executeCodeQAICommand(projectPath, args);
      console.log('CodeQAI index sync completed');
    } catch (error: any) {
      console.error('CodeQAI sync failed:', error);
      throw new Error(`CodeQAI sync failed: ${error.message}`);
    }
  }

  // Check if project is indexed recently
  async isIndexStale(projectPath: string, maxAgeHours: number = 24): Promise<boolean> {
    try {
      const codeqaiDir = path.join(projectPath, '.codeqai');
      const indexFile = path.join(codeqaiDir, 'index.faiss');
      
      const stats = await fs.stat(indexFile);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      
      return ageHours > maxAgeHours;
    } catch (error) {
      // If we can't check, assume it's stale
      return true;
    }
  }
}