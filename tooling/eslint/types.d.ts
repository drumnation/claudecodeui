declare module 'eslint-plugin-markdown' {
  import type {ESLint, Linter} from 'eslint';

  const plugin: ESLint.Plugin & {
    processors: {
      markdown: Linter.Processor;
    };
  };

  export default plugin;
}

declare module 'eslint-plugin-better-styled-components' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-styled-components-a11y' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: {
        rules: Record<string, Linter.RuleEntry>;
      };
    };
  };

  export default plugin;
}

declare module 'eslint-plugin-sort-keys-fix' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-typescript-sort-keys' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-simple-import-sort' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-import' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-react' {
  import type {ESLint, Linter} from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: {
        rules: Record<string, Linter.RuleEntry>;
      };
    };
  };

  export default plugin;
}

declare module 'eslint-plugin-react-hooks' {
  import type {ESLint, Linter} from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: {
        rules: Record<string, Linter.RuleEntry>;
      };
    };
  };

  export default plugin;
}

declare module 'eslint-plugin-react-refresh' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-prettier' {
  import type {ESLint} from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-storybook' {
  import type {ESLint, Linter} from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      'flat/recommended': Array<Linter.Config>;
    };
  };

  export default plugin;
}

declare module 'eslint-plugin-playwright' {
  import type {ESLint, Linter} from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      'flat/recommended': Linter.Config;
    };
  };

  export default plugin;
}

declare module 'eslint-config-turbo/flat' {
  import type {Linter} from 'eslint';

  const config: Linter.FlatConfig;
  export default config;
}

declare module 'eslint-config-turbo' {
  import type {Linter} from 'eslint';

  const config: Linter.Config;
  export = config;
}
