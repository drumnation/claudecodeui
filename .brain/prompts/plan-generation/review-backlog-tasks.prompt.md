# Review and Update Backlog Tasks

## Context
You are an expert software architect and project manager. Your task is to review existing backlog tasks in light of recent project changes and recommend updates to keep the backlog aligned with the current project state.

**Current Tasks:**
{{CURRENT_TASKS}}

**Changes Summary:**
{{CHANGES_SUMMARY}}

**Project Context:**
{{PROJECT_CONTEXT}}

**Timestamp:** {{TIMESTAMP}}

## Instructions

### Step 1: Analyze Current State
- [ ] Review all existing tasks and their current status
- [ ] Understand the relationships and dependencies between tasks
- [ ] Note which tasks are in progress, blocked, or completed
- [ ] Identify the overall project trajectory from the tasks

### Step 2: Evaluate Impact of Changes
- [ ] Analyze how the reported changes affect existing tasks
- [ ] Identify tasks that may no longer be relevant
- [ ] Find tasks that need updated scope or requirements
- [ ] Discover new tasks that should be created
- [ ] Check if priorities need to be adjusted

### Step 3: Categorize Required Updates
For each task that needs changes, determine:
- [ ] **Scope Changes**: Task needs expanded or reduced scope
- [ ] **Priority Changes**: Urgency or importance has shifted
- [ ] **Dependency Changes**: Prerequisites have changed
- [ ] **Obsolescence**: Task is no longer needed
- [ ] **Splitting**: Task should be broken into smaller tasks
- [ ] **Merging**: Multiple tasks should be combined

### Step 4: Provide Clear Rationale
For each recommended update:
- [ ] Explain why the change is necessary
- [ ] Link the change to specific project developments
- [ ] Consider downstream impacts
- [ ] Maintain project continuity

### Step 5: Maintain Task Coherence
Ensure that after updates:
- [ ] Dependencies still form a valid graph
- [ ] No critical work is lost
- [ ] Task sizes remain manageable
- [ ] The backlog tells a coherent story

## Output Format

Generate a JSON array of task updates with the following structure:

```json
[
  {
    "taskId": "existing-task-id",
    "updates": {
      "title": "Updated title if needed",
      "description": "Updated description if needed",
      "priority": "new-priority-if-changed",
      "status": "new-status-if-changed",
      "labels": ["updated", "labels"],
      "dependencies": ["updated", "dependencies"],
      "acceptanceCriteria": ["updated", "criteria"]
    },
    "reason": "Clear explanation of why this update is necessary"
  }
]
```

## Update Patterns

### Pattern 1: Technical Approach Changed
**Situation**: Architecture decision affects implementation
```json
{
  "taskId": "implement-user-service",
  "updates": {
    "description": "Implement user service using the new microservices architecture instead of monolithic approach",
    "labels": ["backend", "microservices", "refactoring"],
    "dependencies": ["setup-service-mesh", "define-service-contracts"]
  },
  "reason": "Project adopted microservices architecture, requiring service-based implementation"
}
```

### Pattern 2: Priority Shift
**Situation**: Business requirements change urgency
```json
{
  "taskId": "add-export-feature",
  "updates": {
    "priority": "critical",
    "status": "in-progress"
  },
  "reason": "Client demo next week requires export functionality to be completed"
}
```

### Pattern 3: Task Obsolescence
**Situation**: Feature no longer needed
```json
{
  "taskId": "integrate-legacy-api",
  "updates": {
    "status": "archived",
    "description": "[ARCHIVED] No longer needed - legacy system being decommissioned"
  },
  "reason": "Legacy system retirement announced, integration no longer required"
}
```

### Pattern 4: Scope Expansion
**Situation**: Additional requirements discovered
```json
{
  "taskId": "implement-search",
  "updates": {
    "description": "Implement search functionality with full-text search, filters, and faceted navigation",
    "acceptanceCriteria": [
      "Full-text search across all content",
      "Filter by date, author, category",
      "Faceted navigation UI",
      "Search results pagination",
      "Search analytics tracking"
    ]
  },
  "reason": "User research revealed need for advanced search features beyond basic keyword search"
}
```

## Decision Framework

When reviewing tasks, consider:

### Keep Task Unchanged If:
- Still relevant to project goals
- Scope and requirements unchanged
- Dependencies remain valid
- Priority still appropriate

### Update Task If:
- Technical approach has evolved
- New information changes requirements
- Dependencies have shifted
- Business priorities changed

### Archive Task If:
- Feature cancelled or postponed indefinitely
- Superseded by other tasks
- No longer aligns with project direction
- Completed with no follow-up needed

### Split Task If:
- Scope has grown too large
- Multiple team members need to work on parts
- Different aspects have different priorities
- Clearer progress tracking needed

## Validation Checklist

Before outputting updates, verify:
- [ ] Each update has a clear, justified reason
- [ ] No critical work is accidentally removed
- [ ] Dependencies remain logically consistent
- [ ] Updates maintain project momentum
- [ ] Changes are traceable to reported project changes
- [ ] Task descriptions remain clear and actionable

## Special Considerations

### In-Progress Tasks
- Be cautious about major changes to active work
- Consider creating new tasks rather than disrupting current work
- Communicate impact on current sprint/iteration

### Blocked Tasks
- Check if changes resolve blocking issues
- Update blockers based on new information
- Consider if task should remain blocked

### High-Priority Tasks
- Ensure changes don't delay critical path
- Validate priority is still justified
- Consider cascade effects on dependent work