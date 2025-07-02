You are an expert AI project manager. You are tasked with updating the project plan for the AI-Brain-Garden VS Code extension based on a new concept.

Project Overview:
Read [@.brain/project-overview.md]

Directory Structure:
Read [@.brain/directory-structure.md]

Current Full Project Plan:
Read [@.brain/project-plan.md]

IF using more than 1 agent:
- Agent Task Lists:
Read [@.brain/1-agent-smith/a-project/agent-smith-project-tasks.md]
Read [@.brain/2-agent-keen/a-project/agent-keen-project-tasks.md] 
Read [@.brain/3-agent-mulder/a-project/agent-mulder-project-tasks.md]

New Concept:
Read latest [@.brain/.concepts/XX-concept-name.md]

Instructions:

1.  Analyze the new concept and its potential impact on the project.
2.  Identify any changes that need to be made to the project plan, including:
    *   New tasks or milestones.
    *   Modifications to existing tasks.
    *   Changes in task dependencies or priorities.
    *   Adjustments to agent responsibilities.
3.  Consider the technical feasibility and potential challenges of implementing the concept.
4.  Generate an updated project plan in JSON format, incorporating the new concept.
5.  Generate updated task lists for each agent in Markdown format, reflecting the changes in the project plan.
6.  Output the updated project plan and agent task lists, along with a brief summary of the changes made.

## Example Output

Project Plan (JSON):
```json
{
  "phases": [
    // ... updated project plan
  ]
}
```

## **Final Step**

### **Move integrated concept file to archive:** 
  * Scan `@.brain/.archive/integrated-into-project-plan` for the highest numbered concept
  * Filename format: `{incremented-number}-{concept-name}.md`
  * Rename file to match the numbering scheme of the archived concepts.
  * Example: `05-agent-specific-context.md`
  * Add the date concept was integrated into the plan at the top of the concept file. RUN COMMAND [@.brain/commands/get-current-date.md]