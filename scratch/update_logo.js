const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\skyeagle\\hubmend\\testing\\doorskill';

const htmlFiles = [
  'admin-login.html',
  'admin.html',
  'auth/client-signup.html',
  'auth/login.html',
  'auth/worker-signup.html',
  'dashboard/client.html',
  'dashboard/worker.html',
  'pages/call.html',
  'pages/chat.html',
  'pages/find-workers.html',
  'pages/post-job.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Auth and other pages often have `<div class="logo"><img src="../assets/logo.png" alt="DoorSkill Logo"></div>`
    // Or `<a href="../index.html" class="logo"><img src="../assets/logo.png" alt="DoorSkill Logo"></a>`
    
    // We want to replace `<img src="...logo.png" alt="DoorSkill Logo">` or similar
    // with an img + text combination
    
    // Regex to find logo images
    const regex = /<img[^>]*src="([^"]*logo\.png)"[^>]*alt="DoorSkill Logo"[^>]*>/g;
    
    content = content.replace(regex, (match, srcPath) => {
      // If it already has styles or width/height, we preserve the srcPath
      // Determine if it's in a white/light context or dark context
      const isDarkContext = match.includes('invert(1)');
      
      const invertStyle = isDarkContext ? 'filter: brightness(0) invert(1); ' : '';
      
      return `<img src="${srcPath}" alt="DoorSkill Logo" style="${invertStyle}height:42px; width:auto;">\n<span style="font-size:26px; font-weight:900; color:${isDarkContext ? '#fff' : 'var(--rose)'}; margin-left:8px; font-family:'Playfair Display', serif; letter-spacing:-0.02em; display:inline-block; vertical-align:middle;">DoorSkill</span>`;
    });
    
    // Also inject JSON-LD into the head of major pages like find-workers, post-job
    if (file.startsWith('pages/')) {
       const jsonLd = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://doorskill.com"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "${file.includes('find') ? 'Find Workers' : 'Post Job'}",
    "item": "https://doorskill.com/${file.replace('\\', '/')}"
  }]
}
</script>
`;
       if (!content.includes('BreadcrumbList')) {
          content = content.replace('</title>', '</title>\n' + jsonLd);
       }
    }
    
    // Fix link style to make flex work
    content = content.replace(/<a[^>]*class="logo"[^>]*>/g, (m) => {
      if(!m.includes('display:flex') && !m.includes('display: flex')) {
         return m.replace('class="logo"', 'class="logo" style="display:flex; align-items:center;"');
      }
      return m;
    });
    
    content = content.replace(/<div[^>]*class="logo"[^>]*>/g, (m) => {
      if(!m.includes('display:flex') && !m.includes('display: flex')) {
         return m.replace('class="logo"', 'class="logo" style="display:flex; align-items:center; justify-content:center;"');
      }
      return m;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
