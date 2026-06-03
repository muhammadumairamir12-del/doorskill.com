const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Insert Latest Blog before Footer
const blogSection = `
<section style="padding:60px 5%;background:var(--pink-bg)">
  <h2 style="text-align:center;font-size:32px;margin-bottom:32px;font-family:'Playfair Display',serif;font-weight:900;color:var(--dark);">Latest Guides</h2>
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
    <!-- Blog 1 -->
    <a href="blog/blog-1.html" style="background:#fff;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;border:1.5px solid var(--border);transition:all 0.3s;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.05);">
      <div style="height:160px;background:linear-gradient(135deg, var(--rose-lt), var(--pink-bg));display:flex;align-items:center;justify-content:center;font-size:48px;">🔧</div>
      <div style="padding:20px;flex:1;">
        <span style="font-size:11px;font-weight:700;color:var(--rose);text-transform:uppercase;letter-spacing:0.05em;">Home Services</span>
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;margin:8px 0;line-height:1.4;color:var(--dark);">How to Find a Trusted Plumber Near You</h3>
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">Discover the best ways to find reliable plumbing professionals in Pakistan.</p>
        <span style="font-size:12px;font-weight:600;color:var(--rose);">Read More →</span>
      </div>
    </a>
    <!-- Blog 2 -->
    <a href="blog/blog-2.html" style="background:#fff;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;border:1.5px solid var(--border);transition:all 0.3s;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,0.05);">
      <div style="height:160px;background:linear-gradient(135deg, #dcfce7, #f0fdf4);display:flex;align-items:center;justify-content:center;font-size:48px;">✅</div>
      <div style="padding:20px;flex:1;">
        <span style="font-size:11px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.05em;">Safety</span>
        <h3 style="font-family:'Playfair Display',serif;font-size:18px;margin:8px 0;line-height:1.4;color:var(--dark);">5 Reasons to Hire a Verified Professional</h3>
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">Learn why taking a gamble on random local helpers can lead to major safety risks.</p>
        <span style="font-size:12px;font-weight:600;color:var(--rose);">Read More →</span>
      </div>
    </a>
  </div>
  <div style="text-align:center;margin-top:32px;">
    <a href="blog/index.html" class="cta-btn-outline" style="color:var(--rose);border-color:var(--rose);">View All Articles</a>
  </div>
</section>
`;

content = content.replace('<!-- ══════════════ FOOTER ══════════════ -->', blogSection + '\n<!-- ══════════════ FOOTER ══════════════ -->');

// Insert Video Container
const videoHtml = `
<div class="video-container" style="max-width:800px;margin:24px auto;position:relative;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.15);cursor:pointer;" onclick="playPromoVideo()">
  <img src="assets/poster.jpg" alt="Video Cover" style="width:100%;display:block;filter:brightness(0.7);background:#333;min-height:300px;">
  <div class="play-btn" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);width:80px;height:80px;background:var(--rose);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;box-shadow:0 0 0 10px rgba(244,63,94,0.3);transition:all 0.3s;">▶</div>
</div>
`;

content = content.replace('<!-- CHANGE #1 — Subtitle moved BELOW search bar -->', videoHtml + '\n<!-- CHANGE #1 — Subtitle moved BELOW search bar -->');

// Insert JS Logic
const jsLogic = `
<script>
function playPromoVideo() {
  const container = document.querySelector('.video-container');
  container.innerHTML = \`<iframe width="100%" height="450" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allowfullscreen></iframe>\`;
  
  // Update view count in Firestore
  if(window.db) {
    const vcRef = db.collection('stats').doc('homepage_video');
    vcRef.get().then(doc => {
      if(doc.exists) {
        vcRef.update({ views: firebase.firestore.FieldValue.increment(1) });
      }
    });
  }
}
</script>
`;

content = content.replace('</body>', jsLogic + '\n</body>');

fs.writeFileSync('index.html', content, 'utf8');
