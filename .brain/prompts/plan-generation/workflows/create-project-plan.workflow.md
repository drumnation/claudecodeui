# Create Feature Plan Workflow

Choose your planning mode:
1. [ ] Full Planning - Comprehensive multi-agent project with full test coverage
2. [ ] MVP Planning - Single developer, core features only, integration tests
3. [ ] Hybrid - MVP first, then expand with full planning

IF `Full Planning` EXECUTE `.brain/prompts/plan-generation/create-feature-plan.prompt.md`
ELSE IF `MVP Planning` EXECUTE `.brain/prompts/plan-generation/create-feature-plan-mvp.prompt.md`
ELSE IF `Hybrid` EXECUTE `.brain/prompts/plan-generation/create-feature-plan-mvp.prompt.md` THEN `.brain/prompts/plan-generation/create-feature-plan.prompt.md`