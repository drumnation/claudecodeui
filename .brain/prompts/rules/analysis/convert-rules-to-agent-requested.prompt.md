# Prompt: Optimize Rule Context Usage

Purpose: Analyze all or selected `.rules.mdc` files in your .cursor/rules directory and suggest which ones can be converted to `agent-requested` with a specific trigger.

This helps reduce context bloat while improving performance and targeting.

Instructions:
- You can run this on a single file or an entire folder (e.g. `/core/documentation/`).
- The agent will return one of the following:
  - ✅ Suggest converting to `agent-requested` with a specific trigger
  - ❌ Recommend keeping as `always`, `auto-attached`, or `manual` with a reason
- If converted, you'll be shown the updated frontmatter and `trigger:` to paste into the rule file.

Good use cases:
- You want to clean up unnecessary `always` or `auto-attached` rules
- You want to prep your rule repo for multi-agent workflows or long contexts
- You're auditing a freshly installed rule pack

Example query:
> Optimize all the rules in `core/documentation/` and tell me which ones could become `agent-requested`.
