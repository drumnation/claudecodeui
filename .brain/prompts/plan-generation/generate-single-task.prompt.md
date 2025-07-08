# Generate Single Backlog Task

## Context
You are an expert software architect and project manager. Your task is to take a brief task description and expand it into a complete, well-structured backlog task with all necessary details for implementation.

**Task Description:**
{{TASK_DESCRIPTION}}

**Project Context:**
{{PROJECT_CONTEXT}}

**Timestamp:** {{TIMESTAMP}}

## Instructions

### Step 1: Analyze Task Description
- [ ] Extract the core objective from the description
- [ ] Identify implicit requirements or assumptions
- [ ] Consider the technical domain and context
- [ ] Note any constraints or dependencies mentioned
- [ ] Determine the type of work (feature, bug fix, refactoring, etc.)

### Step 2: Expand Task Scope
- [ ] Define clear boundaries for the task
- [ ] Identify specific technical components involved
- [ ] Consider edge cases and error scenarios
- [ ] Think about testing requirements
- [ ] Identify potential risks or challenges

### Step 3: Determine Implementation Details
- [ ] Break down into implementation steps
- [ ] Identify required technologies or tools
- [ ] Consider architectural patterns to follow
- [ ] Note any research or investigation needed
- [ ] Define measurable outcomes

### Step 4: Set Task Metadata
- [ ] **Priority**: Assess based on business value and technical importance
- [ ] **Labels**: Apply relevant categorization tags
- [ ] **Dependencies**: Identify prerequisite tasks or systems
- [ ] **Estimation**: Consider complexity and effort required

### Step 5: Define Success Criteria
- [ ] Create specific, testable acceptance criteria
- [ ] Include functional requirements
- [ ] Add non-functional requirements (performance, security, etc.)
- [ ] Define "Definition of Done"
- [ ] Consider how to verify completion

## Output Format

Generate a single task in JSON format:

```json
{
  "title": "Clear, actionable task title (max 80 chars)",
  "description": "Comprehensive description with all implementation details",
  "priority": "critical|high|medium|low",
  "status": "todo",
  "labels": ["relevant", "categorical", "tags"],
  "dependencies": ["prerequisite-task-ids"],
  "acceptanceCriteria": [
    "Specific measurable outcome",
    "Another verifiable requirement"
  ]
}
```

## Expansion Examples

### Example 1: Vague to Specific
**Input**: "Add search to the app"

**Output**:
```json
{
  "title": "Implement full-text search with filtering and pagination",
  "description": "Add comprehensive search functionality to the application including:\n- Full-text search across all content types (posts, comments, user profiles)\n- Real-time search suggestions as user types\n- Advanced filters for date range, content type, and author\n- Paginated results with 20 items per page\n- Search result highlighting\n- Search analytics to track popular queries\n\nTechnical approach:\n- Use Elasticsearch for search backend\n- Implement search API endpoints with proper caching\n- Create reusable search UI components\n- Add debouncing to prevent excessive API calls\n- Implement proper error handling for search failures",
  "priority": "high",
  "status": "todo",
  "labels": ["feature", "backend", "frontend", "search", "ux"],
  "dependencies": ["setup-elasticsearch", "define-content-schemas"],
  "acceptanceCriteria": [
    "Search returns relevant results within 200ms",
    "Filters can be combined (AND logic)",
    "Search works across all content types",
    "Pagination handles large result sets",
    "Search suggestions appear after 2 characters",
    "Empty state messaging for no results",
    "Error handling for search service failures",
    "Search analytics events are tracked"
  ]
}
```

### Example 2: Technical Task
**Input**: "Optimize database queries"

**Output**:
```json
{
  "title": "Optimize slow database queries and add query monitoring",
  "description": "Identify and optimize database queries that are causing performance issues:\n\n1. Profile current database usage to identify slow queries (>100ms)\n2. Add appropriate indexes for frequently accessed columns\n3. Refactor N+1 queries to use eager loading\n4. Implement query result caching for stable data\n5. Add query performance monitoring and alerting\n\nFocus areas:\n- User dashboard queries (currently ~500ms)\n- Report generation queries (currently ~2s)\n- Search queries with multiple joins\n- Background job queries affecting user experience\n\nImplement monitoring using application performance monitoring (APM) to track query performance over time.",
  "priority": "high",
  "status": "todo",
  "labels": ["performance", "backend", "database", "optimization"],
  "dependencies": ["setup-apm-monitoring"],
  "acceptanceCriteria": [
    "All user-facing queries complete in <100ms",
    "Report generation reduced to <500ms",
    "Query monitoring dashboard implemented",
    "Slow query alerts configured (>200ms)",
    "Database CPU usage reduced by >30%",
    "No N+1 queries in critical paths",
    "Query performance tests added to CI"
  ]
}
```

### Example 3: Bug Fix
**Input**: "Fix login issues on mobile"

**Output**:
```json
{
  "title": "Fix mobile login authentication and session persistence issues",
  "description": "Resolve reported issues with user login on mobile devices:\n\nReported problems:\n- Login form doesn't submit on some mobile browsers\n- Sessions expire immediately after backgrounding app\n- Password field autocomplete not working\n- 'Remember me' option not persisting\n- Touch ID/Face ID integration broken on iOS\n\nRequired fixes:\n1. Debug form submission on mobile Safari and Chrome\n2. Implement proper session handling for mobile web apps\n3. Fix autocomplete attributes for password managers\n4. Store secure refresh tokens for persistent login\n5. Update biometric authentication integration\n\nTest on: iOS Safari, iOS Chrome, Android Chrome, Android Firefox",
  "priority": "critical",
  "status": "todo",
  "labels": ["bug", "mobile", "authentication", "ux"],
  "dependencies": [],
  "acceptanceCriteria": [
    "Login works on all major mobile browsers",
    "Sessions persist when app is backgrounded",
    "Password managers can save/fill credentials",
    "'Remember me' keeps users logged in for 30 days",
    "Biometric login works on supported devices",
    "No security vulnerabilities introduced",
    "Mobile login flow tested on 5+ device types"
  ]
}
```

## Enhancement Guidelines

### For Feature Requests:
- Define user stories and use cases
- Include UI/UX considerations
- Specify integration points
- Consider scalability requirements

### For Bug Fixes:
- Include reproduction steps
- Define root cause if known
- Specify affected versions/platforms
- Include regression test requirements

### For Technical Debt:
- Explain current problems
- Define improvement metrics
- Include migration strategy
- Specify rollback plan

### For Research Tasks:
- Define research questions
- Specify deliverables
- Include evaluation criteria
- Set decision deadlines

## Quality Checklist

Before outputting the task, ensure:
- [ ] Title is specific and actionable
- [ ] Description provides complete context
- [ ] All requirements are clearly stated
- [ ] Acceptance criteria are measurable
- [ ] Priority reflects actual importance
- [ ] Labels accurately categorize the work
- [ ] Dependencies are valid and necessary
- [ ] Task is appropriately scoped (1-3 days of work)

## Edge Cases

### When Description is Too Vague:
- Make reasonable assumptions based on common patterns
- Include tasks for clarification/research
- Add notes about assumptions made

### When Scope is Too Large:
- Focus on the most critical aspect
- Note follow-up tasks needed
- Suggest task breakdown

### When Context is Missing:
- Use generic best practices
- Include investigation steps
- Add flexibility in approach