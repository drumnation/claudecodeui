# Project Complexity Reality Check Prompt

## Context
Use this prompt when you're deep into a project and suspect you might be overengineering. This is especially useful when:
- You've been building for days/weeks without user-testable results
- The project plan has 10+ features but you're still on feature 2-3
- You're building complex abstractions "for the future"
- Tests are passing but you can't actually USE the system yet

## The Prompt

```markdown
I need you to perform a brutal complexity reality check on my project. I tend to overcomplicate things - building elaborate systems with too many features, abstractions, and "future-proofing" that ends up slowing me down. I often spend days getting lints, types, and tests to pass for features that I later realize were unnecessary.

Please analyze my project and tell me:

## 1. Core Need Analysis
What is the SIMPLEST version of what I'm actually trying to accomplish? Strip away all the nice-to-haves and focus only on the core value proposition. What would a working prototype need to do TODAY to be useful?

## 2. Current State Audit
- What have I built so far?
- What percentage is actually necessary for the core functionality?
- What parts are premature optimization or overengineering?
- How close am I to having something I can actually USE and get feedback from?

## 3. Complexity Traps
Identify where I've fallen into these common traps:
- Building multiple fallback systems before the primary system is proven
- Creating abstractions for future features that don't exist yet
- Writing extensive tests for code that might get thrown away
- Optimizing for edge cases before handling the happy path
- Building "pluggable architectures" when I only need one implementation

## 4. The "One Day" Test
If I threw away all the complex parts and just built the core functionality, what could I have working in ONE DAY? Be specific about:
- What code to keep (usually <20% of what's built)
- What to delete immediately
- What simple solution would work for now
- How to get to a testable state ASAP

## 5. Recommended Pivot
Give me a concrete plan to:
1. Strip down to essentials
2. Get something working TODAY that I can actually use
3. Start getting REAL feedback instead of imagined requirements
4. Build only what's justified by actual usage

## 6. API/Integration Minimum
If other systems need to integrate (like my Brain Garden OS agents), what's the MINIMUM API needed? Usually 3-4 endpoints max for MVP.

## 7. The Brain Garden Studio Lesson
I rebuilt Brain Garden Studio from scratch after overcomplexity killed it. The rebuild took 1 day and worked better than the original. Apply this lesson: What would the "second attempt" version of this project look like if I started fresh with only the core insight?

Be direct and even harsh if needed. Tell me what to DELETE, not what to add. Remember: Working software used by humans beats perfect architecture every time. I need something I can TEST WITH REAL USAGE today, not a perfect system next month.

Here's my project: [paste project overview, current status, and code structure]
```

## Key Principles This Prompt Enforces

1. **Simplicity First**: Build the simplest thing that could possibly work
2. **Usage Over Architecture**: Real usage feedback beats imagined requirements
3. **Delete Liberally**: Most code in early projects is waste
4. **One Day Rule**: If it can't be built in a day, it's probably too complex for MVP
5. **Test with Humans**: Systems without users are just expensive hobbies
6. **Iterate from Reality**: Build based on what you learn from actual usage

## Example Insights This Prompt Should Surface

- "You've built a multi-engine OCR system but GPT-4 Vision alone would work fine"
- "You have 366 tests but no working product - delete 350 of them"
- "Your 16-feature plan could be 4 features that actually matter"
- "You're on day 2 of a file watcher - the core value is in document analysis"
- "Complex categorization pipeline when one GPT-4 call would suffice"

## When to Use This Prompt

- Before starting: Sanity check your project plan
- Weekly during development: Course correct before too much complexity
- When feeling stuck: Often complexity is the blocker
- Before major architectural decisions: YAGNI check
- When velocity slows: Complexity is usually the culprit

Remember: The goal isn't to build the perfect system, it's to build something useful that you can improve based on real feedback. Perfect is the enemy of good, and good enough today beats perfect never.