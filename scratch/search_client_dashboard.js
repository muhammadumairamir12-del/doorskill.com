const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dashboard/client.html');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('Education') || line.includes('Home Repairs') || line.includes('IT & Tech') || line.includes('Browse by Category')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
