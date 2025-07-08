# Create Backlog Tasks from Planning Text

## Context
You are an expert software architect and project manager. Your task is to analyze planning text and convert it into well-structured, actionable backlog tasks. The tasks should be specific, measurable, achievable, relevant, and time-bound (SMART).

**Project Context:**
{{PROJECT_CONTEXT}}

**Planning Text:**
{{PLAN_TEXT}}

**Timestamp:** {{TIMESTAMP}}

## Instructions

### Step 1: Analyze Planning Text
- [ ] Read through the entire planning text carefully
- [ ] Identify the main objectives and goals
- [ ] Note any technical requirements or constraints
- [ ] Identify dependencies between different parts
- [ ] Consider the current project state and existing codebase

### Step 2: Extract Actionable Items
- [ ] Break down high-level goals into specific tasks
- [ ] Ensure each task represents a single, coherent unit of work
- [ ] Tasks should be completable within 1-3 days of focused work
- [ ] Identify technical implementation details for each task
- [ ] Note any research or investigation tasks needed

### Step 3: Determine Task Properties
For each task, determine:
- [ ] **Title**: Clear, concise description (max 80 characters)
- [ ] **Description**: Detailed explanation of what needs to be done
- [ ] **Priority**: Critical, High, Medium, or Low based on:
  - Impact on project goals
  - Blocking other tasks
  - Business value
  - Technical debt reduction
- [ ] **Status**: Usually "todo" for new tasks
- [ ] **Labels**: Relevant tags (e.g., "frontend", "backend", "api", "ui", "bug", "feature")
- [ ] **Dependencies**: Task IDs that must be completed first
- [ ] **Acceptance Criteria**: Clear conditions for task completion

### Step 4: Apply MECE Principle
Ensure tasks are:
- [ ] **Mutually Exclusive**: No overlap between tasks
- [ ] **Collectively Exhaustive**: All aspects of the plan are covered
- [ ] **Properly Scoped**: Neither too large nor too granular

### Step 5: Order Tasks Logically
- [ ] Group related tasks together
- [ ] Order by dependencies (prerequisites first)
- [ ] Consider parallel work streams
- [ ] Balance workload across different skill sets

## Output Format

Generate a JSON array of tasks with the following structure:

```json
[
  {
    "title": "Clear, actionable task title",
    "description": "Detailed description of what needs to be done, including technical details and context",
    "priority": "high|medium|low|critical",
    "status": "todo",
    "labels": ["relevant", "tags"],
    "dependencies": ["task-id-1", "task-id-2"],
    "acceptanceCriteria": [
      "Specific condition that must be met",
      "Another measurable outcome"
    ]
  }
]
```

## Examples

### Good Task Breakdown
**Planning Text**: "We need to add user authentication to the app"

**Generated Tasks**:
```json
[
  {
    "title": "Research and select authentication strategy",
    "description": "Evaluate authentication options (JWT, OAuth, session-based) and select the most appropriate for our use case. Consider security, scalability, and ease of implementation.",
    "priority": "high",
    "status": "todo",
    "labels": ["research", "security", "architecture"],
    "dependencies": [],
    "acceptanceCriteria": [
      "Document comparing at least 3 authentication strategies",
      "Clear recommendation with justification",
      "Implementation plan outlined"
    ]
  },
  {
    "title": "Set up authentication backend infrastructure",
    "description": "Implement the core authentication system including user model, password hashing, token generation, and validation middleware.",
    "priority": "high",
    "status": "todo",
    "labels": ["backend", "api", "security"],
    "dependencies": ["research-auth-strategy"],
    "acceptanceCriteria": [
      "User model with secure password storage",
      "Token generation and validation working",
      "Authentication middleware protecting routes",
      "Unit tests with >90% coverage"
    ]
  },
  {
    "title": "Create login and registration UI components",
    "description": "Build responsive login and registration forms with proper validation, error handling, and loading states.",
    "priority": "medium",
    "status": "todo",
    "labels": ["frontend", "ui", "components"],
    "dependencies": [],
    "acceptanceCriteria": [
      "Login form with email/password fields",
      "Registration form with validation",
      "Error message display",
      "Loading states during API calls",
      "Responsive design for mobile and desktop"
    ]
  }
]
```

## Validation Checklist

Before outputting tasks, verify:
- [ ] Each task has a unique, descriptive title
- [ ] Descriptions provide enough context for implementation
- [ ] Priorities reflect actual importance and urgency
- [ ] Dependencies form a valid directed acyclic graph (no circular dependencies)
- [ ] Labels are consistent and meaningful
- [ ] Acceptance criteria are specific and testable
- [ ] No task is too large (should fit in 1-3 days of work)
- [ ] All aspects of the planning text are addressed

## Error Handling

If the planning text is:
- **Too vague**: Create research/investigation tasks first
- **Too large**: Break down into phases or milestones
- **Missing technical details**: Add tasks for technical design
- **Unclear dependencies**: Create tasks to clarify requirements

Always err on the side of creating more specific, smaller tasks rather than large, ambiguous ones.