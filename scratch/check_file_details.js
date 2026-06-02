const fs = require('fs');
const path = require('path');

const filesToInspect = [
  'auth/client-signup.html',
  'auth/worker-signup.html',
  'index.html',
  'pages/find-workers.html'
];

const keywords = [
  'tutor', 'doctor', 'freelance', 'global', 'quran', 'education', 
  'it & tech', 'web developer', 'math teacher'
];

filesToInspect.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  console.log(`\n--- Inspecting: ${file} ---`);
  lines.forEach((line, index) => {
    keywords.forEach(keyword => {
      if (line.toLowerCase().includes(keyword)) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  });
});
