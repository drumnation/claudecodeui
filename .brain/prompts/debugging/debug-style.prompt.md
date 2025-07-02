# 🔍 React Styled-Components Debug Protocol

## 🛠️ Refactoring Strategy

1. Layout Simplification:
   - Extract complex style logic
   - Implement compound components
   - Use Radix slot patterns
   - Simplify prop interfaces
   - Create reusable style mixins

2. Component Pattern Improvements:
   - Flatten component hierarchy
   - Optimize style composition
   - Enhance prop interfaces
   - Modernize layout patterns

## 🔎 Analysis Framework

1. Styled-Components Structure
   - Component inheritance chains
   - Theme token usage
   - Style interpolation complexity
   - Dynamic styles/props
   - Radix composition patterns

2. Layout Assessment
   - Check styled-component nesting
   - Evaluate Radix primitive usage
   - Review responsive interpolations
   - Identify prop drilling issues
   - Analyze style composition

## 📚 Storybook Verification

1. Story Location:
   - Find story at `./apps/storybook/src/stories/{workgroup}/{library-name}/{feature-name}/{feature-name}.stories.ts`
   - If no story exists, create new one following project standards

2. Story Updates (Read @rules/tools/storybook/storybook.rules.ts):
   - Verify all component changes are reflected
   - Update affected variants
   - Add new variants if needed
   - Document prop changes
   - Include responsive examples
   - Show theme variations

## 🔍 TestID Verification

1. Story Location:
   - Read testID rules at @testid-creation-guide.md
   - Verify every interactive element has proper testID
   - Follow component testID naming hierarchy
   - Ensure unique identification for testing

2. TestID Structure:
   - Check parent-child relationships
   - Verify uniqueness within context
   - Follow naming conventions
   - Maintain consistent patterns

## ✅ Implementation Checklist

1. Component Changes:
   - [ ] Visual appearance matches requirements
   - [ ] Simplified structure where possible
   - [ ] Optimized style patterns
   - [ ] Responsive behavior verified

2. Storybook Updates:
   - [ ] Story reflects all changes
   - [ ] All variants documented
   - [ ] Props documentation current
   - [ ] Examples match implementation
   - [ ] Documentation complete

3. TestID Updates:
   - [ ] Interactive elements have testIDs
   - [ ] TestIDs follow naming rules
   - [ ] TestIDs are unique in context
   - [ ] Parent-child relationships clear
   - [ ] Documentation updated if needed

## ⚠️ CRITICAL PROTOCOL RULES

1. DO NOT MODIFY ANY CODE UNTIL:
   - User has fully described the issue
   - You have asked clarifying questions
   - User has confirmed your understanding
   - User has approved suggested changes

2. NEVER:
   - Rewrite component code before analysis
   - Make assumptions about theme structure
   - Apply fixes without user confirmation
   - Create new Storybook stories without verification

3. ALWAYS:
   - Wait for user input before suggesting changes
   - Verify theme properties exist before using them
   - Double-check TypeScript interfaces
   - Get explicit user approval for structural changes
   - Add/verify testIDs following @testid-creation-guide.md
   - Fix missing/incorrect testIDs when found
   - Read the @preview.tsx before updating or writing new storybook stories. 
     - Story is already hooked up to redux, routing, etc.

❗ If you are seeing this prompt, your first and only action should be to ask the user to describe their styling issue and provide the requested initial details. Do not proceed with any analysis or changes until they do.

## 📋 Protocol Steps

1. Initial Request:
   First, I will ask you to provide:
   - 📸 Screenshot of current visual state
   - 🎯 Description of desired appearance
   - 📋 Component code
   - 📱 Viewport size (if applicable)

2. Information Gathering:
   - Ask clarifying questions about the issue
   - Request any missing context
   - Confirm understanding of desired outcome

3. Analysis:
   - Apply analysis framework
   - Identify root causes
   - Determine if refactoring is needed

4. Solution Development:
   - Present findings
   - Propose solutions
   - Discuss trade-offs
   - Confirm approach

5. Implementation:
   - Provide step-by-step fixes
   - Include code examples
   - Note potential side effects

6. Storybook Verification:
   - Check/update documentation
   - Verify all changes are reflected
   - Ensure completeness

## 🔄 Context Monitor
When capacity near limit:
1. ✅ Finish task
2. 📋 Summarize
3. ⏸️ Signal handoff
> 💡 Awaiting handoff command

What styling issue are you encountering? Please provide the initial details and I'll begin our debugging process.