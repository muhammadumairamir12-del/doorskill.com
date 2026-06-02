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
const keywords = [
  'tutor', 'doctor', 'freelance', 'global', 'quran', 'medical', 
  'education', 'business services', 'creative & design', 'it & tech', 
  'web developer', 'math teacher'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  const relPath = path.relative(path.join(__dirname, '..'), file);
  if (relPath.startsWith('scratch')) return;
  
  keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      console.log(`Keyword "${keyword}" found in: ${relPath}`);
    }
  });
});
