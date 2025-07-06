# Project Plan Generator

**Purpose:** To facilitate a comprehensive and collaborative process between the Agent Architect and the Human Architect to create a high-level project plan. This plan will be broken down into phases, features, and agent assignments, using the MECE principle for clear task allocation. It will also guide the creation of specialized agents and identify knowledge base requirements.

## Instructions to the Agent:

**DO NOT START WRITING THE PLAN YET.**

First, read this entire template and understand your process. Then, execute each step in order. Your goal is to facilitate a discussion with the Human Architect, gather information, make recommendations, and ultimately fill in each section of the project plan template below.

---

## Step 1: Initial Information Gathering & Onboarding

1.  **Review Existing Documentation:**
    *   Familiarize yourself with the provided `project-overview.md` document. Pay close attention to the tech stack, project purpose, and any other background information.
    *   Review the existing `directory-structure.md` to understand the project's organization.
2.  **Human Architect Collaboration:**
    *   **Initiate a discussion** with the Human Architect (me).
    *   **Acknowledge** the receipt and review of the `project-overview.md` and `directory-structure.md`.
    *   **Prompt** the Human Architect: "Do you have any other relevant documents or information to share at this time?"
    *   **Actively listen** and incorporate any additional information provided.
3.  **Populate the following in the plan template:**
    *   `# Project: [Project Name]`
    *   `## Status: ⭕ Planning`
    *   `## Last Updated: [YYYY-MM-DD]`
    *   `## 1. Project Overview`
        *   `### 1.1. Objectives`
            *   \[Clearly defined project objectives, refined based on discussion]
            *   `[ ]` Confirmed objectives with Human Architect.
        *   `### 1.2. Scope`
            *   Inclusions: \[What is included in the project]
            *   Exclusions: \[What is explicitly excluded from the project]
            *   `[ ]` Confirmed scope with Human Architect.
        *   `### 1.3. Key Stakeholders`
            *   \[List of key stakeholders and their roles]
            *   `[ ]` Confirmed stakeholders with Human Architect.
        *   `### 1.4. Technology Stack`
            *   \[Detailed description of the technology stack, based on `project-overview.md` and discussion]
            *   `[ ]` Confirmed technology stack with Human Architect.

## Step 2: Define Project Phases

1.  **Collaborative Phase Definition:**
    *   **Propose** a breakdown of the project into logical phases (e.g., Planning, Design, Development, Testing, Deployment, Maintenance).
    *   **Discuss** the proposed phases with the Human Architect, considering dependencies and potential overlaps.
    *   **Revise** the phases based on feedback.
2.  **Populate the following in the plan template:**
    *   `## 2. Project Phases`
    *   `### 2.1. Proposed Phases`
        *   Phase 1: \[Phase Name] - \[Brief Description]
        *   Phase 2: \[Phase Name] - \[Brief Description]
        *   Phase 3: \[Phase Name] - \[Brief Description]
        *   \[Continue adding phases as needed]
        *   `[ ]` Confirmed phases with Human Architect.

## Step 3: Determine Agent Specialization and Team Composition

1.  **Agent Quantity Determination:**
    *   **Analyze** the project's complexity, scope, and phases.
    *   **Recommend** the number of agents needed for the project.
    *   **Discuss** the recommendation with the Human Architect and reach an agreement.
2.  **Agent Specialization Design:**
    *   **Propose** agent roles and specializations based on the project's technology stack and the identified phases.
    *   **Consider** creating agents specializing in:
        *   Frontend Development
        *   Backend Development
        *   Database Management
        *   Testing and QA
        *   DevOps and Deployment
        *   Specific technologies or frameworks (e.g., React, Angular, Node.js, AWS)
    *   **Discuss** and refine agent specializations with the Human Architect.
3.  **Agent Persona Development:**
    *   For each agent role, **suggest** a list of 3-5 fictional characters (from TV shows or movies) known as "Agent \[Character Name]" who embody the desired traits and skills for that role.
    *   **Discuss** the options with the Human Architect and select a persona for each agent.
    *   **Develop** a brief personality profile for each agent, highlighting their key characteristics and how they contribute to the team.
4.  **Populate the following in the plan template:**
    *   `## 3. Agent Team Composition`
    *   `### 3.1. Number of Agents`
        *   `[Number]` agents (e.g., `3 agents`)
        *   `[ ]` Confirmed number of agents with Human Architect.
    *   `### 3.2. Agent Specializations`
        *   Agent 1: \[Specialization] - \[Brief Description]
        *   Agent 2: \[Specialization] - \[Brief Description]
        *   Agent 3: \[Specialization] - \[Brief Description] (if applicable)
        *   \[Continue adding agents as needed]
        *   `[ ]` Confirmed agent specializations with Human Architect.
    *   `### 3.3. Agent Personas`
        *   Agent 1: Agent \[Character Name] - \[Personality Profile]
        *   Agent 2: Agent \[Character Name] - \[Personality Profile]
        *   Agent 3: Agent \[Character Name] - \[Personality Profile] (if applicable)
        *   \[Continue adding agents as needed]
        *   `[ ]` Confirmed agent personas with Human Architect.

## Step 4: MECE Feature Breakdown and Prioritization

1.  **Collaborative Feature Decomposition:**
    *   **Brainstorm** a list of all major features required to meet the project objectives, using the MECE principle.
    *   **Discuss** and refine the feature list with the Human Architect, ensuring no overlaps and complete coverage.
2.  **Feature Prioritization:**
    *   **Recommend** a prioritization method (e.g., MoSCoW).
    *   **Discuss** and prioritize the features with the Human Architect.
3.  **Populate the following in the plan template:**
    *   `## 4. MECE Feature Breakdown`
    *   `### 4.1. Feature Prioritization`
        *   \[Describe the method used for prioritizing features]
        *   `[ ]` Confirmed prioritization method with Human Architect.
    *   `### 4.2. Feature List (Prioritized)`
        *   `[ ]` Feature 1: \[Feature Name] - \[Brief Description] (Priority: \[High/Medium/Low])
        *   `[ ]` Feature 2: \[Feature Name] - \[Brief Description] (Priority: \[High/Medium/Low])
        *   `[ ]` Feature 3: \[Feature Name] - \[Brief Description] (Priority: \[High/Medium/Low])
        *   \[Continue adding features as needed]
        *   `[ ]` Confirmed feature list and priorities with Human Architect.

## Step 5: Agent Task Allocation

1.  **Collaborative Task Assignment:**
    *   **Propose** an allocation of features to each agent, based on their specialization and the prioritized feature list.
    *   **Discuss** the proposed allocation with the Human Architect, ensuring a balanced workload and considering dependencies between features.
    *   **Adjust** the allocation based on feedback.
2.  **Populate the following in the plan template:**
    *   `## 5. Agent Task Allocation`
    *   `### 5.1. Agent 1: [Agent Name/ID]`
        *   `[ ]` Feature: \[Feature Name]
        *   `[ ]` Feature: \[Feature Name]
    *   `### 5.2. Agent 2: [Agent Name/ID]`
        *   `[ ]` Feature: \[Feature Name]
        *   `[ ]` Feature: \[Feature Name]
    *   `### 5.3. Agent 3: [Agent Name/ID]` (if applicable)
        *   `[ ]` Feature: \[Feature Name]
        *   [Continue adding agents and features as needed]
    *   `[ ]` Confirmed task allocation with Human Architect.
    *   `### 5.4. Workload Distribution`
        *   \[ ] Confirmed the agent workloads are balanced.

## Step 6: Knowledge Base Assessment and Development Plan

1.  **Identify Knowledge Requirements:**
    *   Based on the defined agent specializations, features, and technology stack, **identify** the specific knowledge, skills, and tools each agent will need.
    *   **Create** a list of required knowledge areas.
2.  **Assess Existing Knowledge Base:**
    *   **Review** the current contents of the `.brain/knowledge/` directory.
    *   **Determine** if the existing knowledge base adequately covers the identified requirements.
3.  **Develop Knowledge Gap Plan:**
    *   **Create** a list of missing or incomplete knowledge areas.
    *   **Prioritize** the knowledge gaps based on their impact on the project.
    *   **Outline** a plan for creating or acquiring the necessary knowledge resources (e.g., tutorials, documentation, best practice guides).
4.  **Populate the following in the plan template:**
    *   `## 6. Knowledge Base Assessment and Development`
    *   `### 6.1. Required Knowledge Areas`
        *   \[List of required knowledge areas for each agent and the project as a whole]
    *   `### 6.2. Knowledge Base Gaps`
        *   \[List of missing or incomplete knowledge areas, prioritized]
    *   `### 6.3. Knowledge Development Plan`
        *   \[Plan for creating or acquiring the necessary knowledge resources. Include specific file names and content outlines for new knowledge documents to be added to `.brain/knowledge/`]
        *   `[ ]` Confirmed knowledge development plan with Human Architect.

## Step 7: Agent `cursorrules` Configuration

1.  **Define Agent-Specific Scenarios:**
    *   For each agent, **brainstorm** a list of common scenarios or tasks they are likely to encounter during development.
    *   Consider scenarios related to their specialization, assigned features, and the technology stack.
2.  **Map Scenarios to Knowledge and Commands:**
    *   For each scenario, **identify** the relevant knowledge resources (from `.brain/knowledge/`) and terminal commands that the agent will need.
    *   **Use** the `@` notation to link to knowledge resources.
3.  **Create or Update Agent `cursorrules` Files:**
    *   **Create** a dedicated `cursorrules` file for each agent within their respective folders in the `.brain` directory (e.g., `.brain/agent-alpha/cursorrules`).
    *   **Populate** each `cursorrules` file with a mapping of scenarios to knowledge resources and commands, using a clear and consistent format. This will allow you to define a prompt scenario, then map out the steps, the files, and commands to accomplish the prompt.
4.  **Populate the following in the plan template:**
    *   `## 7. Agent `cursorrules` Configuration`
    *   `### 7.1. Agent 1: [Agent Name/ID]`
        *   Scenario 1: \[Scenario Description]
            *   Knowledge: `Read ["@./brain/knowledge/relevant-guide.md"]`
            *   Command: `[Terminal command]`
        *   Scenario 2: \[Scenario Description]
            *   Knowledge: `Read ["@./brain/knowledge/another-guide.md"]`
            *   Command: `[Terminal command]`
        *   `[ ]` `cursorrules` file created/updated for Agent 1.
    *   `### 7.2. Agent 2: [Agent Name/ID]`
        *   \[Similar structure as Agent 1]
        *   `[ ]` `cursorrules` file created/updated for Agent 2.
    *   `### 7.3. Agent 3: [Agent Name/ID]` (if applicable)
        *   \[Similar structure as Agent 1]
        *   `[ ]` `cursorrules` file created/updated for Agent 3.
    *   \[Continue adding agents as needed]

## Step 8: Generate Individual Agent Plans & Full Project Task List

1.  **Create separate Markdown files for each agent:**
    *   Use a consistent naming convention: `agent-plan-[Agent Name/ID].md` (e.g., `agent-plan-alpha.md`, `agent-plan-beta.md`).
    *   These files will be stored in each agent's respective folder within the `.brain` directory.
    *   Each agent plan should contain:
        *   A link to the main project plan (`project-plan.md`).
        *   A clear list of the features assigned to that agent.
        *   Instructions to follow the `create-feature-task-plan-from-project-plan.md` template to generate detailed plans for each assigned feature.
2.  **Create the `project-plan.md` file:**
    *   This file will reside in the `.brain` directory.
    *   It will provide a consolidated view of all project phases, features, agent assignments, and links to individual agent plans.
3.  **Populate the following in the plan template:**
    *   `## 8. Plan Generation`
    *   `### 8.1. Individual Agent Plans`
        *   Location: `.brain/[Agent Name/ID]/agent-plan-[Agent Name/ID].md`
        *   `[ ]` Agent 1 Plan Generated: `agent-plan-alpha.md`
        *   `[ ]` Agent 2 Plan Generated: `agent-plan-beta.md`
        *   `[ ]` Agent 3 Plan Generated: `agent-plan-gamma.md` (if applicable)
        *   \[Continue adding agents as needed]
    *   `### 8.2. Full Project Task List`
        *   Location: `.brain/project-plan.md`
        *   `[ ]` Full project task list generated: `project-plan.md`

---

## Plan Template:

```markdown
# Project: [Project Name]

## Status: ⭕ Planning

## Last Updated: [YYYY-MM-DD]

## 1. Project Overview

### 1.1. Objectives

*   [Clearly defined project objectives, refined based on discussion]
*   `[ ]` Confirmed objectives with Human Architect.

### 1.2. Scope

*   Inclusions: [What is included in the project]
*   Exclusions: [What is explicitly excluded from the project]
*   `[ ]` Confirmed scope with Human Architect.

### 1.3. Key Stakeholders

*   [List of key stakeholders and their roles]
*   `[ ]` Confirmed stakeholders with Human Architect.

### 1.4. Technology Stack

*   [Detailed description of the technology stack, based on `project-overview.md` and discussion]
*   `[ ]` Confirmed technology stack with Human Architect.

## 2. Project Phases

### 2.1. Proposed Phases

*   Phase 1: [Phase Name] - [Brief Description]
*   Phase 2: [Phase Name] - [Brief Description]
*   Phase 3: [Phase Name] - [Brief Description]
*   [Continue adding phases as needed]
*   `[ ]` Confirmed phases with Human Architect.

## 3. Agent Team Composition

### 3.1. Number of Agents

*   `[Number]` agents (e.g., `3 agents`)
*   `[ ]` Confirmed number of agents with Human Architect.

### 3.2. Agent Specializations

*   Agent 1: [Specialization] - [Brief Description]
*   Agent 2: [Specialization] - [Brief Description]
*   Agent 3: [Specialization] - [Brief Description] (if applicable)
*   [Continue adding agents as needed]
*   `[ ]` Confirmed agent specializations with Human Architect.

### 3.3. Agent Personas

*   Agent 1: Agent [Character Name] - [Personality Profile]
*   Agent 2: Agent [Character Name] - [Personality Profile]
*   Agent 3: Agent [Character Name] - [Personality Profile] (if applicable)
*   [Continue adding agents as needed]
*   `[ ]` Confirmed agent personas with Human Architect.

## 4. MECE Feature Breakdown

### 4.1. Feature Prioritization

*   [Describe the method used for prioritizing features]
*   `[ ]` Confirmed prioritization method with Human Architect.

### 4.2. Feature List (Prioritized)

*   `[ ]` Feature 1: [Feature Name] - [Brief Description] (Priority: [High/Medium/Low])
*   `[ ]` Feature 2: [Feature Name] - [Brief Description] (Priority: [High/Medium/Low])
*   `[ ]` Feature 3: [Feature Name] - [Brief Description] (Priority: [High/Medium/Low])
*   [Continue adding features as needed]
*   `[ ]` Confirmed feature list and priorities with Human Architect.

Yes, you are absolutely right! I apologize for the abrupt ending. Here's the continuation of the template, picking up where we left off with **Section 5: Agent Task Allocation** and completing the rest of the plan:

```markdown
## 5. Agent Task Allocation

### 5.1. Agent 1: [Agent Name/ID]

*   `[ ]` Feature: [Feature Name]
*   `[ ]` Feature: [Feature Name]

### 5.2. Agent 2: [Agent Name/ID]

*   `[ ]` Feature: [Feature Name]
*   `[ ]` Feature: [Feature Name]

### 5.3. Agent 3: [Agent Name/ID] (if applicable)

*   `[ ]` Feature: [Feature Name]
*   [Continue adding agents and features as needed]

### 5.4. Workload Distribution
*   `[ ]` Confirmed task allocation with Human Architect.
*   `[ ]` Confirmed the agent workloads are balanced.

## 6. Knowledge Base Assessment and Development

### 6.1. Required Knowledge Areas

*   [List of required knowledge areas for each agent and the project as a whole]

### 6.2. Knowledge Base Gaps

*   [List of missing or incomplete knowledge areas, prioritized]

### 6.3. Knowledge Development Plan

*   [Plan for creating or acquiring the necessary knowledge resources. Include specific file names and content outlines for new knowledge documents to be added to `.brain/knowledge/`]
*   `[ ]` Confirmed knowledge development plan with Human Architect.

## 7. Agent `cursorrules` Configuration

### 7.1. Agent 1: [Agent Name/ID]

*   Scenario 1: [Scenario Description]
    *   Knowledge: `Read ["@./brain/knowledge/relevant-guide.md"]`
    *   Command: `[Terminal command]`
*   Scenario 2: [Scenario Description]
    *   Knowledge: `Read ["@./brain/knowledge/another-guide.md"]`
    *   Command: `[Terminal command]`
*   `[ ]` `cursorrules` file created/updated for Agent 1.

### 7.2. Agent 2: [Agent Name/ID]

*   [Similar structure as Agent 1]
*   `[ ]` `cursorrules` file created/updated for Agent 2.

### 7.3. Agent 3: [Agent Name/ID] (if applicable)

*   [Similar structure as Agent 1]
*   `[ ]` `cursorrules` file created/updated for Agent 3.

*   [Continue adding agents as needed]

## 8. Plan Generation

### 8.1. Individual Agent Plans

*   Location: `.brain/[Agent Name/ID]/agent-plan-[Agent Name/ID].md`
*   `[ ]` Agent 1 Plan Generated: `agent-plan-alpha.md`
*   `[ ]` Agent 2 Plan Generated: `agent-plan-beta.md`
*   `[ ]` Agent 3 Plan Generated: `agent-plan-gamma.md` (if applicable)
*   [Continue adding agents as needed]

### 8.2. Full Project Task List

*   Location: `.brain/project-plan.md`
*   `[ ]` Full project task list generated: `project-plan.md`
```

---

**Example `agent-plan-alpha.md`:**

```markdown
# Agent Plan: Alpha

**Project:** [Project Name]

**Last Updated:** [YYYY-MM-DD]

**Main Project Plan:** [Link to .brain/project-plan.md]

## Assigned Features:

*   `[ ]` Feature: [Feature Name]
*   `[ ]` Feature: [Feature Name]

## Instructions:

For each assigned feature, use the `create-feature-task-plan-from-project-plan.md` template to generate a detailed task plan. Save each feature plan in your designated folder within the `.brain` directory.
```

---

**Example snippet from `.brain/project-plan.md`:**

```markdown
# Project: [Project Name] - Full Task List

## Status: ⭕ Planning

## Last Updated:** [YYYY-MM-DD]

## Phase 1: Planning

*   `[ ]` Feature: Project Setup (Agent: Alpha) - [Link to agent-plan-alpha.md]
*   `[ ]` Feature: Initial Design (Agent: Beta) - [Link to agent-plan-beta.md]

## Phase 2: Development

*   `[ ]` Feature: User Authentication (Agent: Alpha) - [Link to agent-plan-alpha.md]
*   `[ ]` Feature: Data Management (Agent: Beta) - [Link to agent-plan-beta.md]
*   `[ ]` Feature: Reporting Module (Agent: Gamma) - [Link to agent-plan-gamma.md]

... (Continue adding phases, features, and links to agent plans) ...
```

## 🔄 Context Monitor

### 📊 Instructions
Monitor your available context capacity. When you estimate capacity for only one more meaningful operation:

1. ✅ Complete current task
2. 📋 Provide status summary
3. ⏸️ Signal for handoff

> 💡 I will initiate the handoff protocol when you signal

This comprehensive template will guide the Agent Architect through a thorough project planning process, ensuring a well-defined project plan, specialized agents, and a robust knowledge base to support development. Remember that this template should be saved as create-project-plan.md in your prompts library.