const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

const replacements = [
  // 1. HERO HEADLINE
  {
    target: `    <h1>\n      Find Trusted <em>Home Services</em><br/>\n      &amp; Skilled Trades Near You\n    </h1>`,
    replacement: `    <h1>\n      Hire Verified <em>Local Professionals</em><br/>\n      for Any Task, Any Skill, Instantly.\n    </h1>`
  },
  // 2. HERO SUBHEADLINE
  {
    target: `    <p class="hero-sub">\n      DoorSkill connects you with verified local professionals for\n      <strong>home repairs, cleaning, maintenance</strong> — plumbers, electricians,\n      cleaners, AC mechanics, painters, and more.\n      Fast. Safe. Reliable.\n    </p>`,
    replacement: `    <p class="hero-sub">\n      Your trusted gateway to pre-screened local specialists. Get free bids, read authentic reviews,\n      and hire safely with CNIC-verified identity checks, secure escrow protection, and in-app chat.\n    </p>`
  },
  // 3. STATS STRIP
  {
    target: `  <div class="stats-strip">\n    <div class="stat"><div class="stat-num" id="stat-workers">12K+</div><div class="stat-lbl">Verified Providers</div></div>\n    <div class="stat"><div class="stat-num" id="stat-jobs">45K+</div><div class="stat-lbl">Jobs Completed</div></div>\n    <div class="stat"><div class="stat-num">120+</div><div class="stat-lbl">Cities Covered</div></div>\n    <div class="stat"><div class="stat-num">4.8★</div><div class="stat-lbl">Avg. Rating</div></div>\n  </div>`,
    replacement: `  <div class="stats-strip">\n    <div class="stat"><div class="stat-num" id="stat-workers">12K+</div><div class="stat-lbl">Active Specialists</div></div>\n    <div class="stat"><div class="stat-num" id="stat-jobs">45K+</div><div class="stat-lbl">Successful Projects</div></div>\n    <div class="stat"><div class="stat-num">120+</div><div class="stat-lbl">Urban Centers</div></div>\n    <div class="stat"><div class="stat-num">4.8★</div><div class="stat-lbl">Client Satisfaction</div></div>\n  </div>`
  },
  // 4. HOW IT WORKS
  {
    target: `  <div class="steps-grid">\n    <div class="step-card"><div class="step-num">01</div><div class="step-icon">📋</div><div class="step-title">Post Your Job</div><div class="step-desc">Describe what you need, set your budget. Nearby workers get notified <strong>instantly</strong>.</div></div>\n    <div class="step-card"><div class="step-num">02</div><div class="step-icon">📬</div><div class="step-title">Receive Bids</div><div class="step-desc">Workers near you send price quotes. Compare profiles, ratings, reviews — choose the best fit.</div></div>\n    <div class="step-card"><div class="step-num">03</div><div class="step-icon">💬</div><div class="step-title">Chat &amp; Confirm</div><div class="step-desc">Chat or call inside DoorSkill — no WhatsApp needed. Worker confirms within 20 minutes.</div></div>\n    <div class="step-card"><div class="step-num">04</div><div class="step-icon">⭐</div><div class="step-title">Pay &amp; Rate</div><div class="step-desc">Pay safely through the platform. Leave a star rating to help the community.</div></div>\n  </div>`,
    replacement: `  <div class="steps-grid">\n    <div class="step-card"><div class="step-num">01</div><div class="step-icon">📋</div><div class="step-title">Post Your Job</div><div class="step-desc">Describe your project requirements and set your flexible budget limit. Verified professionals in your area will be notified of your request instantly.</div></div>\n    <div class="step-card"><div class="step-num">02</div><div class="step-icon">📬</div><div class="step-title">Receive Bids</div><div class="step-desc">Receive competitive, transparent quotes directly from nearby specialists. Compare expert profiles, historical work, and genuine ratings to pick the perfect provider.</div></div>\n    <div class="step-card"><div class="step-num">03</div><div class="step-icon">💬</div><div class="step-title">Chat &amp; Confirm</div><div class="step-desc">Communicate and coordinate details securely using our encrypted in-app messaging. Confirm details and schedules with confidence.</div></div>\n    <div class="step-card"><div class="step-num">04</div><div class="step-icon">⭐</div><div class="step-title">Pay &amp; Rate</div><div class="step-desc">Release payments securely only when you are 100% satisfied with the completed work. Rate your experience to maintain our community quality standards.</div></div>\n  </div>`
  },
  // 5. ABOUT SECTION
  {
    target: `  <div class="trust-grid" style="grid-template-columns:1fr; max-width:800px; margin:0 auto; text-align:left; gap:30px;">\n    <div style="background:#fff; border-radius:16px; padding:30px; box-shadow:0 10px 40px rgba(0,0,0,0.05);">\n      <h3 style="font-size:20px; font-weight:800; color:var(--dark); margin-bottom:12px;">Our Mission</h3>\n      <p style="color:var(--mid); line-height:1.7; font-size:15px; margin-bottom:20px;">\n        We believe that finding reliable help for any task should be seamless, secure, and fast. Whether you need a trusted plumber, electrician, AC mechanic, or cleaner in your city, DoorSkill brings them directly to your digital doorstep.\n      </p>\n      <h3 style="font-size:20px; font-weight:800; color:var(--dark); margin-bottom:12px;">Why We Built This</h3>\n      <p style="color:var(--mid); line-height:1.7; font-size:15px; margin-bottom:20px;">\n        Traditional hiring is slow and lacks transparency. DoorSkill introduces an intelligent bidding system, rigorous identity verification (CNIC & Live Capture), and integrated escrow payments to ensure that every job is completed with maximum trust and safety. \n      </p>\n      <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">✅ 100% Verified Workers</div>\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">🔒 Escrow Protection</div>\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">💬 Secure In-App Chat</div>\n      </div>\n    </div>\n  </div>`,
    replacement: `  <div class="trust-grid" style="grid-template-columns:1fr; max-width:800px; margin:0 auto; text-align:left; gap:30px;">\n    <div style="background:#fff; border-radius:16px; padding:30px; box-shadow:0 10px 40px rgba(0,0,0,0.05);">\n      <h3 style="font-size:20px; font-weight:800; color:var(--dark); margin-bottom:12px;">Our Mission</h3>\n      <p style="color:var(--mid); line-height:1.7; font-size:15px; margin-bottom:20px;">\n        To empower communities by building the world's most trusted connection engine between clients and skilled professionals. We strive to make expert services universally accessible, safe, and transparent for everyone, everywhere.\n      </p>\n      <h3 style="font-size:20px; font-weight:800; color:var(--dark); margin-bottom:12px;">Why We Built This</h3>\n      <p style="color:var(--mid); line-height:1.7; font-size:15px; margin-bottom:20px;">\n        Traditional hiring channels are fragmented, slow, and carry significant security risks for both parties. DoorSkill bridges this gap by combining live CNIC verification, an open-bid marketplace, and secure escrow payments to eliminate fraud and guarantee quality completion.\n      </p>\n      <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">✅ 100% Verified: CNIC &amp; Background Screened</div>\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">🔒 Escrow Protection: Pay Only Upon Satisfaction</div>\n        <div style="background:var(--rose-lt); color:var(--rose); padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px;">💬 Secure Chat: Coordinate Safely In-App</div>\n      </div>\n    </div>\n  </div>`
  },
  // 6. FINAL CTA SECTION
  {
    target: `  <h2>Ready to Get Started?</h2>\n  <p>Join thousands of clients and skilled workers already growing with DoorSkill.</p>`,
    replacement: `  <h2>Take the First Step to Smarter Hiring &amp; Earning</h2>\n  <p>Whether you need top-tier local help for your projects or want to expand your business by offering your specialized skills, DoorSkill is your platform.</p>`
  },
  // 7. FOOTER TAGLINE
  {
    target: `      <p>Connecting clients with verified local home service professionals. Fast, safe, and reliable — every time.</p>`,
    replacement: `      <p>Connecting clients with verified local professionals globally. Secure, efficient, and dependable services at your doorstep.</p>`
  }
];

replacements.forEach(({ target, replacement }, idx) => {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Successfully updated section ${idx + 1}!`);
  } else {
    console.error(`Section ${idx + 1} target not found!`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("index.html text updates completed successfully!");
