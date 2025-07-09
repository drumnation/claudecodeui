# Brain Monitor - Enhanced Validation System

The Brain Monitor is a comprehensive validation system that provides robust error reporting, timeout handling, and task parallelization for continuous integration and development workflows.

## Features

- **Timeout Handling**: Prevents validation tasks from hanging indefinitely
- **Error Categorization**: Separates critical errors from warnings
- **Task Parallelization**: Runs validation tasks concurrently for better performance
- **Detailed Reporting**: Provides comprehensive error reports with troubleshooting tips
- **Storybook Integration**: Supports comprehensive Storybook testing
- **Fallback Mechanisms**: Handles failed tasks gracefully
- **Enhanced Statistics**: Provides detailed validation statistics and pass rates

## Installation

The Brain Monitor is included as a workspace dependency. To use it:

```bash
npm install
```

## Available Commands

### Core Validation Commands

```bash
# Run all validations
npm run brain:validate

# Run only critical validations (TypeScript + Tests)
npm run brain:validate-critical

# Run quick validations (no tests)
npm run brain:validate-quick

# Run specific validation types
npm run brain:typecheck-failures
npm run brain:lint-failures
npm run brain:format-failures
npm run brain:test-failures
```

### Storybook Testing

```bash
# Run Storybook E2E tests
npm run brain:test-storybook-failures

# Run comprehensive Storybook tests
npm run brain:test-storybook-comprehensive
```

### Monitoring Commands

```bash
# Watch mode for continuous validation
npm run brain:watch

# Monitor dev server logs
npm run brain:logs

# Start dev servers with integrated logging
npm run brain:dev
```

## Task Categories

### Critical (🚨)
- **TypeScript**: Frontend TypeScript compilation
- **TypeScript Backend**: Backend TypeScript compilation
- **Tests**: Frontend unit tests
- **Backend Tests**: Backend unit tests

### Warning (⚠️)
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Optional (ℹ️)
- **Storybook E2E Tests**: Component testing
- **Storybook Comprehensive Tests**: Full integration testing

## Configuration

### Task Timeouts

Each task has a configurable timeout to prevent hanging:

- **TypeScript**: 2 minutes
- **ESLint**: 1.5 minutes  
- **Prettier**: 1 minute
- **Tests**: 5 minutes
- **Storybook Tests**: 10-15 minutes

### Parallelization

Tasks run with controlled parallelization (max 3 concurrent tasks) to optimize performance while avoiding resource conflicts.

## Output and Reporting

### Console Output

The system provides color-coded console output:
- ✅ **Green**: Passed validations
- ❌ **Red**: Failed critical validations
- ⚠️ **Yellow**: Failed warning validations
- ⏱️ **Clock**: Timed out validations

### Error Reports

Detailed error reports are written to `_errors/reports/` with:
- Error categorization
- Execution duration
- Full command output
- Troubleshooting tips

### Validation Summary

A comprehensive summary is written to `_errors/validation-summary.md` containing:
- Overall statistics
- Results by category
- Quick action suggestions
- Available commands

## Example Usage

### Basic Validation

```bash
# Run all validations
npm run brain:validate

# Output:
# 🧠 Brain Monitor - Running validations...
# 
# 🔍 TypeScript: ✅ Passed (2.156s)
# 🔍 TypeScript Backend: ✅ Passed (1.984s)
# 📝 ESLint: ❌ Failed (1.542s) ⚠️
# 💅 Prettier: ✅ Passed (0.234s)
# 🧪 Tests: ✅ Passed (8.765s)
# 
# 📊 Validation Statistics:
#    Total: 5 tasks
#    Passed: 4 (80%)
#    Failed: 1
#    Duration: 8.821s
```

### Critical Only

```bash
# Run only critical validations
npm run brain:validate-critical

# Runs: TypeScript, TypeScript Backend, Tests, Backend Tests
```

### Quick Check

```bash
# Run quick validations (no tests)
npm run brain:validate-quick

# Runs: TypeScript, TypeScript Backend, ESLint, Prettier
```

## Advanced Features

### Automatic Cleanup

Old error reports are automatically cleaned up after 24 hours to prevent disk space issues.

### Fallback Mechanisms

- Tasks that fail to start are handled gracefully
- Timeout errors are distinguished from execution failures
- Process cleanup ensures no hanging processes

### Integration with CI/CD

The Brain Monitor integrates with CI/CD pipelines:
- Returns appropriate exit codes
- Provides structured error reporting
- Supports selective validation runs

## Troubleshooting

### Common Issues

1. **Task Timeouts**: Increase timeout values in task configuration
2. **Parallel Execution Conflicts**: Reduce maxConcurrency setting
3. **Storybook Tests Failing**: Ensure Storybook server is properly configured

### Error Investigation

1. Check `_errors/validation-summary.md` for overview
2. Review specific error reports in `_errors/reports/`
3. Use troubleshooting tips provided in error reports

### Performance Optimization

- Use `brain:validate-quick` for rapid feedback
- Use `brain:validate-critical` before committing
- Use `brain:validate` for comprehensive checks

## Development

### Adding New Tasks

1. Add task configuration to `TASKS` object in `validate.js`
2. Include timeout and category settings
3. Add corresponding CLI command if needed

### Extending Categories

Task categories can be extended by modifying the validation utilities and adding new color/icon mappings.

## API Reference

### Core Functions

- `runValidation(tasks)`: Main validation runner
- `runTask(taskKey)`: Execute individual validation task
- `runTasksInParallel(tasks, maxConcurrency)`: Parallel task execution

### Utility Functions

- `formatDuration(ms)`: Format milliseconds to readable duration
- `getCategoryColor(category)`: Get color for task category
- `ensureErrorDirectories()`: Create error reporting directories
- `writeValidationReport()`: Write detailed error reports

## Contributing

When contributing to the Brain Monitor:

1. Follow the existing task configuration patterns
2. Add appropriate timeout values
3. Include proper error categorization
4. Add troubleshooting tips for new task types
5. Update documentation for new features

## License

This tool is part of the Claude Code UI project and follows the same license terms.