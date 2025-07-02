import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { execSync } from "child_process";

const WORKFLOW_TEMPLATE = `name: Validation
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: \${{ github.workflow }}-\${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Validate Code
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run validations
        run: pnpm brain:validate
        continue-on-error: true
      
      - name: Upload error reports
        if: failure() || cancelled()
        uses: actions/upload-artifact@v4
        with:
          name: validation-errors
          path: _errors/
          retention-days: 7
      
      - name: Comment PR with summary
        if: github.event_name == 'pull_request' && (failure() || cancelled()) && !env.ACT
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            
            const summaryPath = path.join(process.env.GITHUB_WORKSPACE, '_errors/validation-summary.md');
            if (fs.existsSync(summaryPath)) {
              const summary = fs.readFileSync(summaryPath, 'utf8');
              
              // Find and update existing comment or create new one
              const { data: comments } = await github.rest.issues.listComments({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
              });
              
              const botComment = comments.find(comment => 
                comment.user.type === 'Bot' && comment.body.includes('Validation Summary Report')
              );
              
              const body = '## 🤖 Automated Validation Report\\n\\n' + summary;
              
              if (botComment) {
                await github.rest.issues.updateComment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  comment_id: botComment.id,
                  body,
                });
              } else {
                await github.rest.issues.createComment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: context.issue.number,
                  body,
                });
              }
            }

  # Matrix build for different Node versions (optional)
  validate-matrix:
    name: Validate Node \${{ matrix.node }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        node: [18, 20, 22]
        
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run validations
        run: pnpm brain:validate
`;

const PROBLEM_MATCHER_CONTENT = `{
  "problemMatcher": [
    {
      "owner": "tsc",
      "pattern": [
        {
          "regexp": "^(.+)\\\\((\\\\d+),(\\\\d+)\\\\):\\\\s+(error|warning)\\\\s+(TS\\\\d+):\\\\s+(.+)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "code": 5,
          "message": 6
        }
      ]
    },
    {
      "owner": "eslint",
      "pattern": [
        {
          "regexp": "^(.+):(\\\\d+):(\\\\d+):\\\\s+(error|warning)\\\\s+(.+)\\\\s+(.+)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "message": 5,
          "code": 6
        }
      ]
    }
  ]
}`;

export function initCI(): void {
  console.log(
    chalk.blue("🚀 Initializing GitHub Actions for brain-monitor..."),
  );

  const workflowsDir = join(process.cwd(), ".github", "workflows");
  const matchersDir = join(process.cwd(), ".github");

  // Create directories
  mkdirSync(workflowsDir, { recursive: true });

  // 1. Create main workflow
  const workflowPath = join(workflowsDir, "validate.yml");
  if (existsSync(workflowPath)) {
    console.log(
      chalk.yellow(
        "⚠️  validate.yml already exists. Use `brain-monitor ci:update` to update it.",
      ),
    );
  } else {
    writeFileSync(workflowPath, WORKFLOW_TEMPLATE);
    console.log(chalk.green("✅ Created .github/workflows/validate.yml"));
  }

  // 2. Create problem matchers
  const matcherPath = join(matchersDir, "problem-matchers.json");
  writeFileSync(matcherPath, PROBLEM_MATCHER_CONTENT);
  console.log(chalk.green("✅ Created .github/problem-matchers.json"));

  // 3. Check if act is available for local testing
  try {
    execSync("which act", { stdio: "ignore" });
    console.log(chalk.green("✅ act is installed for local testing"));
  } catch {
    console.log(
      chalk.yellow(
        "\n📦 Optional: Install act for local GitHub Actions testing:",
      ),
    );
    console.log(chalk.gray("  brew install act              # macOS"));
    console.log(
      chalk.gray(
        "  curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux",
      ),
    );
    console.log(chalk.gray("  choco install act-cli         # Windows"));
  }

  // 4. Update package.json with CI scripts
  const pkgPath = join(process.cwd(), "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

    if (!pkg.scripts) {
      pkg.scripts = {};
    }

    const ciScripts = {
      "ci:test": "brain-monitor ci:test",
      "ci:test:validate": "brain-monitor ci:test --job validate",
    };

    let updated = false;
    Object.entries(ciScripts).forEach(([key, value]) => {
      if (!pkg.scripts[key]) {
        pkg.scripts[key] = value;
        updated = true;
      }
    });

    if (updated) {
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
      console.log(chalk.green("✅ Added CI scripts to package.json"));
    }
  }

  console.log(chalk.green("\n✅ GitHub Actions CI initialized successfully!"));
  console.log(chalk.yellow("\nNext steps:"));
  console.log("  1. Review .github/workflows/validate.yml");
  console.log("  2. Test locally: `pnpm ci:test`");
  console.log("  3. Commit and push to see it in action");
  console.log("  4. Check Actions tab on GitHub for results");
}
