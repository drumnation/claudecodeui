# Brain-Monitor CI/CD Integration

This module provides GitHub Actions integration for brain-monitor, allowing you to:

1. **Generate GitHub Actions workflows** that run brain-monitor validations
2. **Test workflows locally** using `act`
3. **Automatically comment on PRs** with validation summaries

## Commands

### `brain-monitor ci:init`

Generates a GitHub Actions workflow that:

- Runs on push to main/develop and on pull requests
- Executes `pnpm brain:validate`
- Uploads error reports as artifacts
- Comments on PRs with the validation summary
- Supports matrix builds for multiple Node versions

### `brain-monitor ci:test`

Tests GitHub Actions locally using `act`:

```bash
# Test all jobs
pnpm ci:test

# Test specific job
pnpm ci:test --job validate

# Test specific workflow
pnpm ci:test --workflow validate.yml
```

### `brain-monitor ci:update`

Updates existing brain-monitor workflows to the latest version.

## Generated Workflow Features

- **Concurrency control**: Cancels redundant runs
- **Artifact upload**: Saves `_errors/` directory for debugging
- **PR comments**: Automatically posts validation summary
- **Problem matchers**: Annotates code with errors in GitHub UI
- **Matrix builds**: Optional testing across Node versions
- **Caching**: Uses pnpm cache for faster builds

## Local Testing with act

To test workflows locally, install [act](https://github.com/nektos/act):

```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows
choco install act-cli

# Or via npm
npm install -g @nektos/act
```

Then run:

```bash
pnpm ci:test
```

## Customization

The generated workflow can be customized after creation. Common modifications:

1. **Add more Node versions**: Edit the matrix section
2. **Add deployment steps**: Add jobs after validation
3. **Change trigger branches**: Edit the `on:` section
4. **Add secrets**: Use GitHub repository secrets

## Integration with brain-monitor init

When running `brain-monitor init`, CI setup is automatically included. This ensures new projects get CI/CD from the start.
