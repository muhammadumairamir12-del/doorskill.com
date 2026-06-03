const fs = require('fs');
const path = require('path');

const blogData = {
    'blog-1.html': {
        class: 'hero-1',
        emoji: '🔧',
        title: 'How to Find a Trusted Plumber Near You',
        date: '📅 June 2025',
        read: '⏱ 5 min read',
        tag: '🏷 Home Services'
    },
    'blog-2.html': {
        class: 'hero-2',
        emoji: '✅',
        title: '5 Reasons to Hire a Verified Professional',
        date: '📅 June 2025',
        read: '⏱ 4 min read',
        tag: '🏷 Safety'
    },
    'blog-3.html': {
        class: 'hero-3',
        emoji: '⚙️',
        title: 'How DoorSkill Works: Post a Job in Minutes',
        date: '📅 June 2025',
        read: '⏱ 5 min read',
        tag: '🏷 How To'
    },
    'blog-4.html': {
        class: 'hero-4',
        emoji: '🏠',
        title: 'Top 10 Home Services in Lahore, Karachi & Islamabad',
        date: '📅 June 2025',
        read: '⏱ 7 min read',
        tag: '🏷 Home Services'
    },
    'blog-5.html': {
        class: 'hero-5',
        emoji: '💰',
        title: 'How to Earn Money Using DoorSkill',
        date: '📅 June 2025',
        read: '⏱ 6 min read',
        tag: '🏷 Earn Money'
    }
};

const videoPlaceholder = `
<div class="video-placeholder" style="background:#000;color:#fff;padding:60px 20px;text-align:center;border-radius:12px;margin:32px 0;">
  <span style="font-size:48px;cursor:pointer;">▶️</span>
  <h3 style="margin-top:16px;color:#fff;">Watch: Quick Overview</h3>
</div>
<div class="info-box" style="background:var(--rose-lt);border-left:4px solid var(--rose);padding:20px;border-radius:8px;margin:24px 0;color:var(--dark);">
  <strong>💡 Pro Tip:</strong> Always verify credentials before starting work.
</div>
`;

for (const [filename, data] of Object.entries(blogData)) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace hero section
    const heroPattern = /<section class="blog-hero[\s\S]*?">[\s\S]*?<\/section>/;
    const newHero = `<section class="blog-hero ${data.class}">
  <div class="blog-hero-content">
    <div style="font-size:3rem;margin-bottom:16px">${data.emoji}</div>
    <span class="blog-category">${data.tag.replace('🏷 ', '')}</span>
    <h1>${data.title}</h1>
    <div class="blog-meta">
      <span>${data.date}</span>
      <span>${data.read}</span>
      <span>${data.tag}</span>
    </div>
  </div>
</section>`;
    
    content = content.replace(heroPattern, newHero);

    // Insert video placeholder after first paragraph
    const articleIdx = content.indexOf('<div class="article-content">');
    if (articleIdx !== -1) {
        const firstPStart = content.indexOf('<p>', articleIdx);
        if (firstPStart !== -1) {
            const firstPEnd = content.indexOf('</p>', firstPStart);
            if (firstPEnd !== -1) {
                content = content.slice(0, firstPEnd + 4) + videoPlaceholder + content.slice(firstPEnd + 4);
            }
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filename}`);
}
