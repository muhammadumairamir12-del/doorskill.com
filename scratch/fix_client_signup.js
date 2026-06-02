const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../auth/client-signup.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

// 1. Add canonical & robots
const titleTarget = `<title>DoorSkill — Client Sign Up</title>`;
const titleReplacement = `<title>DoorSkill — Client Sign Up</title>
<link rel="canonical" href="https://www.doorskill.com/auth/client-signup.html"/>
<meta name="robots" content="index, follow"/>`;

if (content.includes(titleTarget)) {
  content = content.replace(titleTarget, titleReplacement);
  console.log("Successfully added canonical/robots tags!");
} else {
  console.error("Title tag target not found!");
}

// 2. Rebrand "Any Skill, Worldwide" benefit block
const benefitTarget = `<div class="benefit-item">
        <div class="benefit-icon">🌍</div>
        <div>
          <div class="benefit-title">Any Skill, Worldwide</div>
          <div class="benefit-desc">
            Plumber, doctor, teacher, developer —
            find any professional near you.
          </div>
        </div>
      </div>`;

const benefitReplacement = `<div class="benefit-item">
        <div class="benefit-icon">🌍</div>
        <div>
          <div class="benefit-title">Any Service, Locally</div>
          <div class="benefit-desc">
            Plumber, cleaner, electrician, mechanic —
            find any skilled professional near you.
          </div>
        </div>
      </div>`;

if (content.includes(benefitTarget)) {
  content = content.replace(benefitTarget, benefitReplacement);
  console.log("Successfully rebranded benefit item!");
} else {
  // Let's try matching with flexible whitespace
  const normalizedTarget = benefitTarget.replace(/\s+/g, ' ').trim();
  let found = false;
  // Try finding and replacing using normalized regex if needed, but let's check
  console.error("Benefit item target not found exactly. We'll search for substrings.");
  // Let's replace the inner parts
  const subTarget1 = `<div class="benefit-title">Any Skill, Worldwide</div>`;
  const subReplacement1 = `<div class="benefit-title">Any Service, Locally</div>`;
  if (content.includes(subTarget1)) {
    content = content.replace(subTarget1, subReplacement1);
    found = true;
  }
  const subTarget2 = `Plumber, doctor, teacher, developer —\n            find any professional near you.`;
  const subReplacement2 = `Plumber, cleaner, electrician, mechanic —\n            find any skilled professional near you.`;
  if (content.includes(subTarget2)) {
    content = content.replace(subTarget2, subReplacement2);
    found = true;
  } else {
    // try with \r\n
    const subTarget2_rn = `Plumber, doctor, teacher, developer —\r\n            find any professional near you.`;
    if (content.includes(subTarget2_rn)) {
      content = content.replace(subTarget2_rn, subReplacement2);
      found = true;
    }
  }
  if (found) {
    console.log("Replaced benefit item parts successfully!");
  } else {
    console.error("Sub-targets for benefit item not found!");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("auth/client-signup.html updated successfully!");
