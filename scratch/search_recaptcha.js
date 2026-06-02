const fs = require('fs');
const path = require('path');

const files = [
  'auth/client-signup.html',
  'auth/worker-signup.html',
  'auth/login.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  console.log(`\n--- ${file} ---`);
  lines.forEach((line, index) => {
    if (line.includes('recaptcha-container') || line.includes('recaptchaVerifier')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
});
