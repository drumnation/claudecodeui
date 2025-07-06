# Migration Guide: @kit/testing Restructure

## Overview

The `@kit/testing` library has been restructured for better organization and scalability. The new structure separates concerns and provides a cleaner API while maintaining backward compatibility.

## New Structure

```
src/
├── configs/          # All test configurations
│   ├── vitest/      # Vitest configs (unit, integration, e2e, storybook)
│   ├── playwright/  # Playwright configs (browser, api, storybook)
│   └── storybook/   # Storybook test-runner config
├── presets/         # Reusable configuration presets
│   ├── coverage.ts  # Coverage thresholds & reporters
│   ├── timeouts.ts  # Timeout configurations
│   ├── pools.ts     # Execution strategies
│   └── reporters.ts # Reporter configurations
├── setup/           # Setup files for each test type
├── utilities/       # Test utilities and helpers
│   └── storybook/   # Storybook-specific utilities
├── runners/         # Test execution orchestration
├── types/          # TypeScript types
└── index.ts        # Clean public API
```

## API Changes

### Modern API (Recommended)

```typescript
// New: Lazy-loaded configurations
import {configs, presets} from '@kit/testing';

// Load a config
export default await configs.vitest.unit();

// With customization using presets
import {mergeConfig} from 'vitest/config';
const baseConfig = await configs.vitest.unit();

export default mergeConfig(baseConfig, {
  test: {
    coverage: presets.coverage.strict, // 90% thresholds
    ...presets.timeouts.medium, // 30s timeouts
  },
});
```

### Legacy API (Still Supported)

```typescript
// Old way still works for backward compatibility
import {unitConfig} from '@kit/testing';
export default unitConfig;
```

## Benefits of New Structure

1. **Clear Separation**: Configs, utilities, and runners are clearly separated
2. **Better Discovery**: Easy to find what you need
3. **Presets**: Reusable configuration patterns
4. **Lazy Loading**: Configs are loaded on-demand for better performance
5. **Type Safety**: Full TypeScript support with improved types

## Migration Steps

### For New Projects

Use the modern API from the start:

```typescript
import {configs, presets} from '@kit/testing';
export default await configs.vitest.unit();
```

### For Existing Projects

1. **No immediate changes required** - Legacy imports still work
2. **Gradually migrate** to new API when updating configs
3. **Use presets** to standardize settings across projects

### Import Path Updates

| Old Import                           | New Import                          |
| ------------------------------------ | ----------------------------------- |
| `@kit/testing/unit`                  | `await configs.vitest.unit()`       |
| `@kit/testing/storybook/interaction` | `utilities.storybook.interaction()` |
| Direct preset access                 | `presets.coverage.strict`           |

## Future Deprecations

The legacy exports will be maintained for at least 2 major versions. A deprecation notice will be added in v2.0, with removal planned for v3.0.

## Questions?

File an issue if you encounter any problems during migration.
