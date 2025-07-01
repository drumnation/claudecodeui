# 🧪 Functional Test Paradigm Validator

**Purpose:**  
Determine if the provided test file or test suite aligns with the functional validation philosophy:  
- Tests should verify real app behavior
- Avoid mocking unless required (e.g. external APIs or system boundaries)
- Avoid testing internal implementation details
- Focus on use cases, real inputs/outputs, user flow, and observable effects

---

## Instructions to the Agent

Given one or more test files, **analyze the test strategy** and report:

### 1. ✅ Adherence Score (0–10)
- **10**: Fully functional — pure I/O verification or user behavior
- **7–9**: Mostly functional, a few minor mock or detail tests
- **4–6**: Mixed — significant implementation detail testing or mocks
- **1–3**: Primarily unit-mocked and non-functional
- **0**: All tests use mocks or inspect internals without verifying observable effects

### 2. ✅ Summary of Issues
- List **mock usage** (`jest.mock`, `vi.mock`, etc.) and why it was used
- Highlight **any shallow render, spy, or internal inspection**
- Point out **tests that don't validate end-user behavior or outcomes**
- Note whether tests appear to have been written after implementation

### 3. ✅ Suggestions for Improvement
- Recommend **how the tests could shift toward real usage**
- Propose test restructuring strategies, like:
  - Using a real service instead of mocking
  - Testing a component through its props + outputs
  - Verifying DOM output, API call results, or state transitions
  - Rewriting tests based on TDD principles

---

## Input Required:

- Test file contents (recommended)
- Optionally, implementation code (to detect mirroring)
- Optionally, commit history or file timestamps to estimate TDD adherence

---

## Output Format:

```json
{
  "adherenceScore": 7,
  "summary": [
    "Used vi.mock for 3 local functions in utils.test.ts — may not be necessary.",
    "One test inspects internal state directly instead of verifying output.",
    "Tests run after implementation; no sign of pre-implementation cycle."
  ],
  "recommendations": [
    "Replace mock of `formatTime` with actual input/output assertion.",
    "Reframe 'calls internal method' test to 'produces expected display result'.",
    "Add one test that fails before implementation to practice RED-GREEN-REFACTOR."
  ]
}
