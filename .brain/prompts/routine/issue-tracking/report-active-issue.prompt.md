## Active Issues Protocol 🔥

An active issue is a large bug that is treated as a feature and tracked like one.

When working long-term on non-test issues:

## Pre-flight:

1.  **Create feature folder:** 
    * Scan `@.brain/1-agent-smith/b-features/` for the highest numbered plan
    * Create a new folder with an incremented number and the feature name
    * Example: `@.brain/1-agent-smith/b-features/05-feature-name/05-feature-name.md`
2. **Create a domain knowledge template file that:**
    * Location: Same folder as the feature plan
    * Filename format: `{incremented-number}-{feature-name}-domain-knowledge.md`
    * Example: `05-feature-name-domain-knowledge.md`
    * Contains section headers for capturing knowledge during/after implementation
    * Includes placeholder text explaining what should go in each section
    * Uses <TO_FILL> or similar markers for sections to be completed later
    * Adds helpful prompts/questions to guide documentation after the feature is built 

Track under:
```markdown
Date: {{ currentDate }}

## Active High Priority Issues
- [ ] Issue: {concise description}
  - Status: In progress
  - Context: {relevant details} 
  - Location: {component/feature}
  - Debug Notes: {key debugging info}
  - References: {related PRs/commits}
  
Last Updated: {date}
```

Add to session doc:
```markdown
## High Priority Updates
- Continued work on #{issue-id}
- New findings: {details}
```

Issue Types:
- Styling 🎨
- UX Issues 🖱️
- Performance ⚡️
- Accessibility ♿️

Tag with: 
- #high-priority
- #in-progress
- #{issue-type}