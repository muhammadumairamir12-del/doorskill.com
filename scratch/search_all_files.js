const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(walk(filePath));
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..'));
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('categoryEmoji')) {
    console.log(`Found categoryEmoji in: ${path.relative(path.join(__dirname, '..'), file)}`);
  }
});
