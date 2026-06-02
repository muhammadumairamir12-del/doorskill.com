const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../auth/worker-signup.html');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('OTP') || line.includes('signInWithPhoneNumber') || line.includes('recaptcha') || line.includes('Verifier')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
