import tseslint from "typescript-eslint";
import baseConfig from "@kit/eslint-config/base";

export default tseslint.config(...baseConfig, {
  ignores: ["dist", "node_modules", "coverage", "bin"],
});
