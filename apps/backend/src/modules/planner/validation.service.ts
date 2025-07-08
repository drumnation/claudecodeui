import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '@kit/logger/node';
import { resolveCli } from '../../lib/cliResolver.js';
import { 
  AgentType, 
  PlannerRequest, 
  ValidationResult, 
  PlannerValidationError 
} from './planner.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger({ scope: 'validation-service' });

export class ValidationService {
  
  async validatePlannerDependencies(request: PlannerRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    let errorType: PlannerValidationError | undefined;
    
    logger.info('Validating planner dependencies', {
      projectPath: request.projectPath,
      selectedAgents: request.selectedAgents
    });
    
    // Validate project path
    const projectValidation = await this.validateProjectPath(request.projectPath);
    if (!projectValidation.success) {
      errors.push(...projectValidation.errors);
      errorType = projectValidation.errorType;
    }
    
    // Validate Claude binary
    const claudeValidation = await this.validateClaudeBinary();
    if (!claudeValidation.success) {
      errors.push(...claudeValidation.errors);
      errorType = errorType || claudeValidation.errorType;
    }
    
    // Validate prompt files
    const promptValidation = await this.validatePromptFiles(request.selectedAgents);
    if (!promptValidation.success) {
      errors.push(...promptValidation.errors);
      errorType = errorType || promptValidation.errorType;
    }
    
    return {
      success: errors.length === 0,
      errors,
      errorType
    };
  }
  
  async validateProjectPath(projectPath: string): Promise<ValidationResult> {
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          errors: [`Project path is not a directory: ${projectPath}`],
          errorType: PlannerValidationError.PROJECT_PATH_INVALID
        };
      }
      
      // Check if we can read the directory
      await fs.access(projectPath, fs.constants.R_OK);
      
      return { success: true, errors: [] };
    } catch (error) {
      logger.error('Project path validation failed', { projectPath, error });
      return {
        success: false,
        errors: [`Project path does not exist or is not accessible: ${projectPath}`],
        errorType: PlannerValidationError.PROJECT_PATH_INVALID
      };
    }
  }
  
  async validateClaudeBinary(): Promise<ValidationResult> {
    try {
      const claudeBinary = await resolveCli('claude', 'CLAUDE_BINARY');
      
      if (!claudeBinary) {
        return {
          success: false,
          errors: [
            'Claude CLI not found. Please install it with "npm install -g @anthropic-ai/claude-cli" or set CLAUDE_BINARY environment variable'
          ],
          errorType: PlannerValidationError.CLAUDE_BINARY_MISSING
        };
      }
      
      // Check if the binary is executable
      try {
        await fs.access(claudeBinary, fs.constants.X_OK);
      } catch (error) {
        return {
          success: false,
          errors: [`Claude CLI at ${claudeBinary} is not executable`],
          errorType: PlannerValidationError.CLAUDE_BINARY_NOT_EXECUTABLE
        };
      }
      
      logger.info('Claude binary validated', { claudeBinary });
      return { success: true, errors: [] };
      
    } catch (error) {
      logger.error('Claude binary validation failed', { error });
      return {
        success: false,
        errors: ['Failed to validate Claude CLI installation'],
        errorType: PlannerValidationError.VALIDATION_ERROR
      };
    }
  }
  
  async validatePromptFiles(agentTypes: AgentType[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const repoRoot = path.resolve(__dirname, '../../../../..');
    
    const promptMap = {
      [AgentType.ARCH]: '.brain/prompts/plan-generation/ARCH/arch-deep-analysis.prompt.md',
      [AgentType.DIFF]: '.brain/prompts/plan-generation/DIFF/diff-analysis.prompt.md',
      [AgentType.DEPS]: '.brain/prompts/plan-generation/DEPS/deps-analysis.prompt.md'
    };
    
    for (const agentType of agentTypes) {
      const promptPath = path.join(repoRoot, promptMap[agentType]);
      
      try {
        await fs.access(promptPath, fs.constants.R_OK);
        logger.debug('Prompt file validated', { agentType, promptPath });
      } catch (error) {
        errors.push(`Prompt file missing for ${agentType} agent: ${promptPath}`);
        logger.error('Prompt file validation failed', { agentType, promptPath, error });
      }
    }
    
    if (errors.length > 0) {
      errors.push('Please ensure all prompt files are present in the .brain/prompts directory');
    }
    
    return {
      success: errors.length === 0,
      errors,
      errorType: errors.length > 0 ? PlannerValidationError.PROMPT_FILE_MISSING : undefined
    };
  }
  
  async validatePromptFile(promptPath: string): Promise<ValidationResult> {
    try {
      await fs.access(promptPath, fs.constants.R_OK);
      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: [`Prompt file not found or not readable: ${promptPath}`],
        errorType: PlannerValidationError.PROMPT_FILE_MISSING
      };
    }
  }
}