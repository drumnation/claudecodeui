# Prompt: Use Monorepo Documentation

## Objective
Consult existing documentation and ensure all new knowledge is saved in the correct location, with package/app-specific scope in a monorepo.

## Instructions for the Agent:

1. **Detect Project Type**
   - Check for `pnpm-workspace.yaml`, `apps/`, `packages/`, or `turbo.json`
   - ✅ If detected, treat this as a monorepo and follow scoped documentation rules

2. **When Searching for Knowledge**
   - Start with `docs/` folders inside the current `apps/*` or `packages/*` subfolder
   - Then check global folders like:
     - `docs/features/`
     - `docs/concepts/`
     - `docs/architecture/`
     - Root `docs/README.md` and `docs.index.md`
   - Use `.index.md` files and `keywords` frontmatter to locate relevant docs

3. **When Writing Documentation**
   - Write to the `docs/` folder of the current working package
   - Add frontmatter and summary per `project-documentation-structure.rules.mdc`
   - Update that folder’s `.index.md` and link the new file
   - Avoid duplicating existing docs—update instead when possible

## Output Reminder
After applying this prompt:
- ✅ Confirm which docs were consulted
- ✅ Show what documentation was updated or created
- ✅ Mention any index files updated for discoverability

## Rule Reference
Follow: `@.brain/rules/agent/procedures/agent-use-monorepo-docs.rules.mdc`
