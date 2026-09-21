const fs = require('fs');
const path = require('path');

const directories = ['pages', 'dashboard'];
let updatedCount = 0;

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Favicon
    if (!content.includes('rel="icon"')) {
      content = content.replace(/<\/head>/, `  <link rel="icon" href="../assets/logo.png" type="image/png"/>\n</head>`);
    }

    // 2. Logo CSS
    if (content.includes(".logo span")) {
      content = content.replace(/\.logo\s*\{[\s\S]*?\}/, `.logo{\n  display:inline-flex;align-items:center;\n  text-decoration:none;\n}\n.logo img { height: 28px; width: auto; }`);
      content = content.replace(/\.logo\s*span\s*\{.*?\}/g, '');
    }

    // 3. Logo HTML
    content = content.replace(/<a([^>]*class="logo"[^>]*)>Door<span>Skill<\/span><\/a>/g, `<a$1><img src="../assets/logo.png" alt="DoorSkill Logo"></a>`);

    // 4. AI Helper
    if (!content.includes('assets/ai-helper.js')) {
      content = content.replace(/<\/body>/, `<script src="../assets/ai-helper.js"></script>\n</body>`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
    updatedCount++;
  });
});

console.log('Total files updated: ' + updatedCount);
