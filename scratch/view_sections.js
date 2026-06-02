const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
const content = fs.readFileSync(filePath, 'utf8');

// Find sections containing specific classes or tags
const lines = content.split('\n');

console.log("=== Finding Hero / Headline ===");
lines.forEach((line, idx) => {
  if (line.includes('class="hero"') || line.includes('hero-title') || line.includes('hero-sub') || line.includes('empower') || line.includes('Numbers That Speak')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log("\n=== Finding How It Works ===");
lines.forEach((line, idx) => {
  if (line.includes('How It Works') || line.includes('Step 1') || line.includes('Step 2') || line.includes('Step 3') || line.includes('Step 4')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log("\n=== Finding Footer Tagline ===");
lines.forEach((line, idx) => {
  if (line.includes('footer') || line.includes('Connecting clients with verified local')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
