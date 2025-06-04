import fs from 'fs';
import path from 'path';

const targetDir = path.resolve('.');
const errors = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.') || dir.includes('/scripts')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.name.endsWith('.js') ||
      entry.name.endsWith('.jsx') ||
      // TypeScript ファイルも検査できるように拡張子を追加
      entry.name.endsWith('.ts') ||
      entry.name.endsWith('.tsx')
    ) {
      checkFile(fullPath);
    }
  }
}

function checkFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes('console.log')) {
      errors.push(`${file}:${idx + 1} console.log を含んでいます`);
    }
  });
}

walk(targetDir);

if (errors.length > 0) {
  for (const msg of errors) {
    console.error(msg);
  }
  console.error(`\u001b[31m${errors.length} 件の問題が見つかりました\u001b[0m`);
  process.exit(1);
} else {
  console.log('\u001b[32mLint OK\u001b[0m');
}
