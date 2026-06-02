const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../auth/worker-signup.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

const replacements = [
  {
    target: `<p>Register your skills and start earning globally</p>`,
    replacement: `<p>Register your skills and start earning locally</p>`
  },
  {
    target: `STEP 1 — LOCATION (Global)`,
    replacement: `STEP 1 — LOCATION (Local)`
  },
  {
    target: `<option value="Other" data-code="">🌍 Other (Global)</option>`,
    replacement: `<option value="Other" data-code="">🌍 Other</option>`
  }
];

replacements.forEach(({ target, replacement }, idx) => {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Successfully replaced worker global text item ${idx + 1}!`);
  } else {
    console.warn(`Worker global text item ${idx + 1} not found!`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("auth/worker-signup.html updated successfully!");
