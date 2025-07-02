---
description: 
globs: 
alwaysApply: true
---
# Rule: Auto-generate and maintain ONBOARDING.md (Monorepo Edition)

## 🧠 Purpose  
Keep the root `ONBOARDING.md` **accurate and current** so new developers can quickly set up their environment and begin working across a multi-package monorepo using `pnpm` and `turborepo`.

---

## 🧭 When to Trigger This Rule

Trigger an update to the `ONBOARDING.md` **after any of the following changes**:

- ✅ New app or package added to the monorepo (`apps/` or `packages/`)
- ✅ New `.env` variables introduced (root or per-app)
- ✅ Updates to environment requirements (e.g. Node, Docker, Colima, Postgres, Vercel)
- ✅ Changes to initial setup commands or workflows
- ✅ Manual linking, migrations, or one-time init steps required for a new service

---

## 📦 What to Include (Root `ONBOARDING.md`)

### 1. ✅ Prerequisites  
Document required tools:
- macOS/Linux instructions (Windows optional or warn unsupported)
- Node.js version (e.g. via Volta or nvm)
- `pnpm` version (use `corepack` if preferred)
- Docker + Colima (for local containers, if used)
- `direnv` or `.env` handling tools
- Global tooling (e.g. `turbo`, `nx`, `postgres`, `redis-cli`)

### 2. ✅ Repo Bootstrap & Setup
Step-by-step instructions:
```bash
# Clone the repo
git clone git@github.com:yourorg/project.git
cd project

# Install dependencies
pnpm install

# Set up local environment (Colima, Docker, etc.)
pnpm run dev:infra

# Start everything
pnpm dev
```

- Explain any necessary Docker containers or Colima profiles
- Link to or auto-generate `.env.example` files
- Mention whether Postgres, Supabase, or Redis services are required and how to start them

### 3. ✅ App & Package Overview

Summarize what lives where:
```txt
/apps
  - dashboard     → Admin UI
  - public-site   → Marketing site

/packages
  - ui            → Reusable design system
  - api           → Shared backend types
```

- Provide `cd` + `pnpm` commands for running individual apps
- Clarify which apps are deployed to Vercel, Netlify, etc.
- Document how to run **Storybook** or test suites

### 4. ✅ Services & External Accounts  
List any **third-party tools** or cloud services required:
- Supabase, Stripe, Clerk/Auth0, Vercel, etc.
- Required env vars or keys
- Whether new devs need to request access or self-provision credentials

---

## 🧱 Format Requirements

- Use **step-by-step Markdown format** with:
  - Numbered setup instructions
  - Fenced `bash` blocks for terminal commands
  - Headings like `## Step 1: Install Prerequisites`
- ✅ Keep scoped to root unless a package requires extra onboarding (then link)

---

## 📁 Optional Per-Package Onboarding

If a specific app or package needs additional setup (e.g. local DB seed, API key, or unique `.env`):

- Create `/apps/app-name/ONBOARDING.md` or `/packages/lib-name/ONBOARDING.md`
- Link from root `ONBOARDING.md`:
  ```md
  > ⚙️ See `apps/public-site/ONBOARDING.md` for marketing site setup
  ```