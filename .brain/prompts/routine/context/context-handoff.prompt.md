# Context Handoff Generator

**Purpose:** Enable instant action by the next agent with zero ramp-up time and maximum context clarity.

## Critical Components

1. Quick Start
```markdown
# Context Handoff {XX}

## Pre-Flight Tasks
- Scan `.brain/1-agent-smith/.context-handoffs` directory and find the highest numbered existing handoff file
- Create a new file with the next sequential number (e.g., if 02-{subject}-context-handoff.md exists, create 03-{subject}-context-handoff.md)
- Never reuse or overwrite existing numbers, always increment from the highest existing number

## TL;DR - Start Here! 🚀 
- Project Plan: Read @.brain/1-agent-smith/b-features/00-create-templates-workspace-library/00-create-templates-workspace-library.md [Original feature requirements]
- Current Goal: [One sentence, crystal clear objective]
- Next Action: [Specific, actionable task to start immediately]
- Critical Files: [Only the 2-3 most important files needed right now]
- Blockers Solved: [Recent wins that unblock progress]

## Analyze available best practices rules:
- Review available rules from @.brain/knowledge/index.md
- IF relevant rules exist:
     - Select up to 5 most applicable rules
     - Include exact file paths from catalog
     - Explain specific relevance to current task
   - IF no relevant rules:
     - State "No directly applicable rules found for this context"
     - Continue with handoff

## State of Play
- What Works: [Bullet-proof functionality we can build on]
- What's Broken: [Known issues with error messages/stack traces]
- Failed Attempts: [What NOT to try again and why]

## Technical Foundation
- Entry Point: `path/to/main.ts` [Where to start reading the code]
- Test Suite: `path/to/tests` [How to validate changes]
- Configuration: [Essential env vars and settings]
```

2. Progress Tracker

```markdown
## Sprint Status

🏃 CURRENT SPRINT GOAL
"[Single focused objective that drives all current work]"

✅ WINS (Last 24h)
- [Recent victories that maintain momentum]
- [Include exact commit hashes if relevant]

🚧 BLOCKED
- [Active blockers with attempted solutions]
- [Include error messages and stack traces]

⚡ NEXT UP
1. [Immediate next action]
2. [Following step]
3. [Subsequent priority]

💡 QUICK WINS
- [Easy tasks to build momentum]
- [Include estimated time: "5min:", "15min:"]
```

3. Deep Context

```markdown
## Architecture Context
- Data Flow: [Diagram or clear description of data movement]
- Key Dependencies: [External services and their status]
- Performance Hot Spots: [Where to be careful about changes]

## Debug Arsenal
- Logging: [How to enable detailed logs]
- Test Data: [Where to find test fixtures]
- Common Fixes: [Quick solutions to frequent errors]

## Success Validation
- Acceptance Criteria: [Specific, testable requirements]
- Test Commands: [Exact commands to validate changes]
- Review Checklist: [What to check before handoff]
```

## Essential Rules for This Task 🎯
Selected from available patterns:

1. Read `[rule-path-1]`
   - Why: [One sentence on direct relevance to current task]
   - Key principles to apply: [Brief bullet]

2. Read `[rule-path-2]`
   [etc...]

## Final Checklist
- [ ] Verify alignment with @.brain/project-plan.md
- [ ] All critical paths documented
- [ ] Clear next actions specified

## 🔄 Context Monitor
When capacity near limit:
1. ✅ Finish task
2. 📋 Summarize
3. ⏸️ Signal handoff
> 💡 Awaiting handoff command