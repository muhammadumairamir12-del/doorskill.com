const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dashboard/worker.html');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('Home Repairs') || line.includes('Education') || line.includes('IT, Web') || line.includes('Select Category')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
