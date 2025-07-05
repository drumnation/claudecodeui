#!/usr/bin/env node
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');
const exts = ['.js', '.jsx'];

glob.sync('src/**/*.{js,jsx}').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  let changed = false;

  content = content.replace(
    /import\s+([^'"]+)\s+from\s+['"](\..*?)['"]/g,
    (match, bindings, spec) => {
      // resolve actual file path
      let target = null;
      for (const ext of exts) {
        const cand = path.resolve(dir, spec + ext);
        const idx  = path.resolve(dir, spec, 'index' + ext);
        if (fs.existsSync(cand)) { target = cand; break; }
        if (fs.existsSync(idx))  { target = idx;  break; }
      }
      if (!target || !target.startsWith(srcRoot)) return match;

      // compute alias path
      let rel = path.relative(srcRoot, target).replace(/\\/g, '/');
      rel = rel.replace(/\.(js|jsx)$/, '').replace(/\/index$/, '');
      const alias = `@/${rel}`;

      changed = true;
      return `import ${bindings} from '${alias}'`;
    }
  );

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`🛠  Fixed imports in ${file}`);
  }
});
