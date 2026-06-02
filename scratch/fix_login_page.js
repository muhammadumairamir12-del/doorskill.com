const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../auth/login.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

const target = `<title>DoorSkill — Login</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="icon" href="../assets/logo.png" type="image/png"/>
<meta name="description" content="Login to DoorSkill. Connect with top professionals worldwide."/>`;

const replacement = `<title>DoorSkill — Login</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="icon" href="../assets/logo.png" type="image/png"/>
<link rel="canonical" href="https://www.doorskill.com/auth/login.html"/>
<meta name="robots" content="index, follow"/>
<meta name="description" content="Login to DoorSkill. Find and hire top-rated local home service professionals and skilled tradespeople."/>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Successfully updated login page metadata!");
} else {
  console.error("Login page metadata target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("auth/login.html updated successfully!");
