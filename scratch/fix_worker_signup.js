const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../auth/worker-signup.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rebrand metadata and add canonical/robots
const metadataTarget = `<title>DoorSkill — Register as Worker</title>
<meta name="description" content="Join DoorSkill as a professional worker and get hired globally. Offer your skills and build your freelance or local service business."/>
<meta name="keywords" content="DoorSkill worker, freelance jobs, professional signup, offer services, find clients globally"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>`;

const metadataReplacement = `<title>DoorSkill — Register as a Local Trade Professional</title>
<meta name="description" content="Join DoorSkill as a local home service professional or skilled tradesperson. Register as a plumber, cleaner, electrician, mechanic, or handyman and get local job requests."/>
<meta name="keywords" content="DoorSkill worker registration, register handyman, plumber registration, electrician signup, local gig work, DoorSkill"/>
<link rel="canonical" href="https://www.doorskill.com/auth/worker-signup.html"/>
<meta name="robots" content="index, follow"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>`;

if (content.includes(metadataTarget)) {
  content = content.replace(metadataTarget, metadataReplacement);
  console.log("Successfully replaced worker-signup metadata and added canonical/robots tags!");
} else {
  console.error("Worker-signup metadata target not found!");
}

// 2. Rebrand category dropdown
const dropdownTarget = `<select id="category">
        <option value="">Select your main category</option>
        <option>🔧 Home Repairs</option>
        <option>📚 Education</option>
        <option>🏥 Health & Medical</option>
        <option>💄 Beauty & Salon</option>
        <option>🧹 Cleaning & Maintenance</option>
        <option>💻 IT, Web & Tech</option>
        <option>🚗 Auto Services</option>
        <option>🍳 Food & Chef</option>
        <option>🏗️ Construction</option>
        <option>📈 Business Services</option>
        <option>🎨 Creative & Design</option>
        <option>🚚 Transport & Delivery</option>
        <option>Other (Custom)</option>
      </select>`;

const dropdownReplacement = `<select id="category">
        <option value="">Select your main category</option>
        <option value="Home Repairs">🔧 Home Repairs</option>
        <option value="Cleaning">🧹 Cleaning</option>
        <option value="Auto Services">🚗 Auto Services</option>
        <option value="Beauty">💄 Beauty</option>
        <option value="Logistics & Helpers">🚚 Logistics &amp; Helpers</option>
        <option value="Other Local Services">✨ Other Local Services</option>
      </select>`;

if (content.includes(dropdownTarget)) {
  content = content.replace(dropdownTarget, dropdownReplacement);
  console.log("Successfully replaced worker-signup category dropdown options!");
} else {
  console.error("Worker-signup category dropdown target not found!");
}

// 3. Rebrand category hint
const hintTarget = '<div class="hint">🌍 Any category — DoorSkill accepts all types of jobs</div>';
const hintTarget2 = '<div class="hint">🌍 Any category — DoorSkill accepts all businesses worldwide</div>';
const hintReplacement = '<div class="hint">🌍 Choose the category that best represents your primary service trade.</div>';

if (content.includes(hintTarget)) {
  content = content.replace(hintTarget, hintReplacement);
  console.log("Replaced category hint (target 1)!");
} else if (content.includes(hintTarget2)) {
  content = content.replace(hintTarget2, hintReplacement);
  console.log("Replaced category hint (target 2)!");
} else {
  console.log("Category hint target not found (might already be changed).");
}

// 4. Rebrand placeholder for skills
const skillInputTarget = 'placeholder="e.g. Plumber, SEO Expert, Tutor..."';
const skillInputReplacement = 'placeholder="e.g. Plumber, AC Repair, Electrician..."';
if (content.includes(skillInputTarget)) {
  content = content.replace(skillInputTarget, skillInputReplacement);
  console.log("Successfully replaced skill input placeholder!");
} else {
  console.log("Skill input placeholder not found (might already be changed).");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("worker-signup.html updated successfully!");
