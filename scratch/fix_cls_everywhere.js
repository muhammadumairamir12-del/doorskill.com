const fs = require('fs');
const path = require('path');

const files = [
  'pages/post-job.html',
  'auth/worker-signup.html',
  'auth/client-signup.html',
  'auth/login.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const target = `<img src="../assets/logo.png" alt="DoorSkill Logo" style="height:42px; width:auto;">`;
  const replacement = `<img src="../assets/logo.png" alt="DoorSkill Logo" width="42" height="42" style="height:42px;">`;
  
  if (content.includes(target)) {
    // replace all occurrences
    content = content.split(target).join(replacement);
    console.log(`Successfully fixed CLS on logo in: ${file}`);
    fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.log(`Logo target not found in: ${file}`);
  }
});
