import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';

export interface UserStory {
  id: string;
  role: string;
  action: string;
  goal: string;
  acceptance: string[];
  tags: string[];
}

export interface StoryCategory {
  name: string;
  stories: UserStory[];
  priority: 'smoke' | 'regression' | 'extended';
}

export interface StoryComplexity {
  score: number;
  factors: {
    acceptanceCriteria: number;
    uiInteractions: number;
    apiCalls: number;
    errorHandling: boolean;
    mobileSupport: boolean;
  };
}

export interface TestRequirements {
  setup: {
    project: boolean;
    session: boolean;
    files: boolean;
    git: boolean;
  };
  elements: string[];
  assertions: string[];
  dependencies: string[];
  mockData: Record<string, any>;
}

export async function parseUserStories(yamlPath: string): Promise<UserStory[]> {
  try {
    const content = await fs.readFile(yamlPath, 'utf-8');
    const stories: UserStory[] = [];
    
    // Split by document separator
    const documents = content.split('\n---\n').filter(doc => doc.trim());
    
    for (const doc of documents) {
      // Skip the header comment
      if (doc.startsWith('#') && !doc.includes('id:')) {
        continue;
      }
      
      try {
        const story = yaml.load(doc) as UserStory;
        if (story && story.id) {
          stories.push(story);
        }
      } catch (e) {
        console.warn(`Failed to parse story document: ${e}`);
      }
    }
    
    console.log(`Parsed ${stories.length} user stories from ${yamlPath}`);
    return stories;
  } catch (error) {
    console.error('Failed to parse user stories:', error);
    throw error;
  }
}

export function categorizeStories(stories: UserStory[]): StoryCategory[] {
  const categoryMap = new Map<string, UserStory[]>();
  
  // Group by primary tag (first tag is category)
  stories.forEach(story => {
    const category = story.tags[0] || 'uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(story);
  });
  
  // Convert to category objects with priority
  const categories: StoryCategory[] = [];
  
  for (const [name, categoryStories] of categoryMap) {
    const priority = determineCategoryPriority(categoryStories);
    categories.push({
      name,
      stories: categoryStories,
      priority,
    });
  }
  
  // Sort categories by priority
  return categories.sort((a, b) => {
    const priorityOrder = { smoke: 0, regression: 1, extended: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function determineCategoryPriority(stories: UserStory[]): 'smoke' | 'regression' | 'extended' {
  const hasSmokeTests = stories.some(s => s.tags.includes('smoke'));
  const hasCoreTests = stories.some(s => s.tags.includes('core'));
  
  if (hasSmokeTests || hasCoreTests) {
    return 'smoke';
  }
  
  const hasDestructive = stories.some(s => s.tags.includes('destructive'));
  const hasIntegration = stories.some(s => s.tags.includes('integration'));
  
  if (hasDestructive || hasIntegration) {
    return 'extended';
  }
  
  return 'regression';
}

export function analyzeStoryComplexity(story: UserStory): StoryComplexity {
  const factors = {
    acceptanceCriteria: story.acceptance.length,
    uiInteractions: countUIInteractions(story),
    apiCalls: countAPICalls(story),
    errorHandling: hasErrorHandling(story),
    mobileSupport: story.tags.includes('mobile'),
  };
  
  // Calculate complexity score (0-100)
  const score = Math.min(100,
    factors.acceptanceCriteria * 10 +
    factors.uiInteractions * 5 +
    factors.apiCalls * 15 +
    (factors.errorHandling ? 20 : 0) +
    (factors.mobileSupport ? 10 : 0)
  );
  
  return { score, factors };
}

function countUIInteractions(story: UserStory): number {
  const interactionKeywords = [
    'click', 'type', 'select', 'drag', 'hover', 'scroll',
    'fill', 'choose', 'toggle', 'expand', 'collapse'
  ];
  
  let count = 0;
  const allText = story.action + ' ' + story.acceptance.join(' ');
  
  interactionKeywords.forEach(keyword => {
    const matches = allText.toLowerCase().match(new RegExp(keyword, 'g'));
    if (matches) {
      count += matches.length;
    }
  });
  
  return count;
}

function countAPICalls(story: UserStory): number {
  const apiKeywords = [
    'save', 'load', 'fetch', 'submit', 'create', 'update',
    'delete', 'commit', 'push', 'pull', 'sync'
  ];
  
  let count = 0;
  const allText = story.action + ' ' + story.acceptance.join(' ');
  
  apiKeywords.forEach(keyword => {
    if (allText.toLowerCase().includes(keyword)) {
      count++;
    }
  });
  
  return count;
}

function hasErrorHandling(story: UserStory): boolean {
  const errorKeywords = ['error', 'fail', 'retry', 'recover', 'handle'];
  const allText = (story.action + ' ' + story.acceptance.join(' ')).toLowerCase();
  
  return errorKeywords.some(keyword => allText.includes(keyword));
}

export function extractTestRequirements(story: UserStory): TestRequirements {
  const requirements: TestRequirements = {
    setup: {
      project: false,
      session: false,
      files: false,
      git: false,
    },
    elements: [],
    assertions: [],
    dependencies: [],
    mockData: {},
  };
  
  // Analyze story for setup requirements
  const allText = story.id + ' ' + story.action + ' ' + story.acceptance.join(' ');
  
  if (allText.toLowerCase().includes('project')) {
    requirements.setup.project = true;
  }
  if (allText.toLowerCase().includes('session') || allText.toLowerCase().includes('chat')) {
    requirements.setup.session = true;
  }
  if (allText.toLowerCase().includes('file') || allText.toLowerCase().includes('editor')) {
    requirements.setup.files = true;
  }
  if (allText.toLowerCase().includes('git') || allText.toLowerCase().includes('commit')) {
    requirements.setup.git = true;
  }
  
  // Extract UI elements
  requirements.elements = extractUIElements(story);
  
  // Extract assertions
  requirements.assertions = extractAssertions(story);
  
  // Determine dependencies
  requirements.dependencies = extractDependencies(story);
  
  // Generate mock data requirements
  requirements.mockData = generateMockData(story);
  
  return requirements;
}

function extractUIElements(story: UserStory): string[] {
  const elements: string[] = [];
  const elementPatterns = [
    /button/gi,
    /input/gi,
    /field/gi,
    /dropdown/gi,
    /checkbox/gi,
    /link/gi,
    /modal/gi,
    /panel/gi,
    /tab/gi,
    /menu/gi,
  ];
  
  const allText = story.action + ' ' + story.acceptance.join(' ');
  
  elementPatterns.forEach(pattern => {
    const matches = allText.match(pattern);
    if (matches) {
      elements.push(...matches.map(m => m.toLowerCase()));
    }
  });
  
  return [...new Set(elements)]; // Remove duplicates
}

function extractAssertions(story: UserStory): string[] {
  const assertions: string[] = [];
  
  story.acceptance.forEach(criterion => {
    const lower = criterion.toLowerCase();
    
    if (lower.includes('visible') || lower.includes('appear')) {
      assertions.push('visibility');
    }
    if (lower.includes('enabled') || lower.includes('disabled')) {
      assertions.push('state');
    }
    if (lower.includes('contains') || lower.includes('shows')) {
      assertions.push('content');
    }
    if (lower.includes('count') || lower.includes('number')) {
      assertions.push('count');
    }
    if (lower.includes('error') || lower.includes('success')) {
      assertions.push('status');
    }
  });
  
  return [...new Set(assertions)];
}

function extractDependencies(story: UserStory): string[] {
  const dependencies: string[] = [];
  
  // Check for explicit dependencies
  if (story.id.includes('SELECT') || story.id.includes('VIEW')) {
    // These usually depend on creation stories
    const baseId = story.id.replace('SELECT', 'CREATE').replace('VIEW', 'CREATE');
    dependencies.push(baseId);
  }
  
  // Check for implicit dependencies
  if (story.action.includes('existing')) {
    dependencies.push('setup_required');
  }
  
  return dependencies;
}

function generateMockData(story: UserStory): Record<string, any> {
  const mockData: Record<string, any> = {};
  
  if (story.tags.includes('project-management')) {
    mockData.project = {
      name: 'test-project',
      path: '/tmp/test-project',
      sessions: ['session-1', 'session-2'],
    };
  }
  
  if (story.tags.includes('chat')) {
    mockData.messages = [
      { role: 'user', content: 'Test message' },
      { role: 'assistant', content: 'Test response' },
    ];
  }
  
  if (story.tags.includes('file-management')) {
    mockData.files = [
      { path: 'src/index.js', type: 'file' },
      { path: 'README.md', type: 'file' },
      { path: 'src', type: 'directory' },
    ];
  }
  
  if (story.tags.includes('git')) {
    mockData.gitStatus = {
      modified: ['src/app.js', 'README.md'],
      untracked: ['new-file.txt'],
      branch: 'main',
    };
  }
  
  return mockData;
}

export function prioritizeStories(stories: UserStory[]): UserStory[] {
  // Sort by multiple factors
  return stories.sort((a, b) => {
    // 1. Smoke tests first
    const aIsSmoke = a.tags.includes('smoke') || a.tags.includes('core');
    const bIsSmoke = b.tags.includes('smoke') || b.tags.includes('core');
    if (aIsSmoke && !bIsSmoke) return -1;
    if (!aIsSmoke && bIsSmoke) return 1;
    
    // 2. Then by dependencies (stories with no deps first)
    const aDeps = extractDependencies(a).length;
    const bDeps = extractDependencies(b).length;
    if (aDeps !== bDeps) return aDeps - bDeps;
    
    // 3. Then by complexity (simpler first)
    const aComplexity = analyzeStoryComplexity(a).score;
    const bComplexity = analyzeStoryComplexity(b).score;
    if (aComplexity !== bComplexity) return aComplexity - bComplexity;
    
    // 4. Finally by ID (alphabetical)
    return a.id.localeCompare(b.id);
  });
}

// Export a function to get stories by specific criteria
export function filterStories(
  stories: UserStory[],
  criteria: {
    tags?: string[];
    complexity?: { min?: number; max?: number };
    category?: string;
  }
): UserStory[] {
  return stories.filter(story => {
    // Filter by tags
    if (criteria.tags && !criteria.tags.some(tag => story.tags.includes(tag))) {
      return false;
    }
    
    // Filter by complexity
    if (criteria.complexity) {
      const complexity = analyzeStoryComplexity(story).score;
      if (criteria.complexity.min && complexity < criteria.complexity.min) {
        return false;
      }
      if (criteria.complexity.max && complexity > criteria.complexity.max) {
        return false;
      }
    }
    
    // Filter by category (first tag)
    if (criteria.category && story.tags[0] !== criteria.category) {
      return false;
    }
    
    return true;
  });
}