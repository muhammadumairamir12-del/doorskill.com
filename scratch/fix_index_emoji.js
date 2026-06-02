const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetRegex = /function categoryEmoji\([\s\S]*?\}\s*?\r?\n\r?\n\/\* City fly-to/;
const replacement = `function categoryEmoji(cat=''){
  if(cat.includes('Home')||cat.includes('Repair')) return '🔧';
  if(cat.includes('Clean')) return '🧹';
  if(cat.includes('Auto')||cat.includes('Car')) return '🚗';
  if(cat.includes('Beauty')) return '💄';
  if(cat.includes('Logistics')||cat.includes('Helper')||cat.includes('Transport')) return '🚚';
  return '✨';
}

/* City fly-to`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacement);
  console.log("Successfully updated categoryEmoji in index.html via regex!");
} else {
  console.error("categoryEmoji target in index.html not found via regex!");
}

fs.writeFileSync(filePath, content, 'utf8');
