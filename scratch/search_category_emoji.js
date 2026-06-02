const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/find-workers.html');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('categoryEmoji')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
