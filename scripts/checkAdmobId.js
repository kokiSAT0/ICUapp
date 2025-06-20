import fs from 'fs';
import path from 'path';

const TEST_ID = '3940256099942544';
let found = false;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (full.match(/\.(ts|tsx|js|jsx)$/)) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes(TEST_ID)) {
        console.error(`テスト用IDが残っています: ${full}`);
        found = true;
      }
    }
  }
}

walk(path.resolve('src'));
if (found) process.exit(1);
