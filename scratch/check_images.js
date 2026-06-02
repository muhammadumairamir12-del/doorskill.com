const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'pages/find-workers.html',
  'pages/post-job.html',
  'auth/worker-signup.html',
  'auth/client-signup.html',
  'auth/login.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n--- Img tags in ${file} ---`);
  const imgRegex = /<img[^>]*>/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    console.log(match[0]);
  }
});
