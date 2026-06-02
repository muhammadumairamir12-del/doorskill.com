const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

// 1. Add keyframes and edit styles for animated hero gradient, 3D flip card, page transition
const stylesTarget = `/* ══ SECTIONS ══ */`;
const stylesReplacement = `
@keyframes fadeInPage {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Page Transition */
body {
  animation: fadeInPage 0.6s ease-out both;
}

/* Animated gradient on hero */
.hero {
  background: linear-gradient(-45deg, #fff, #FFF0F5, #FFE4EC, #ffd6e4) !important;
  background-size: 400% 400% !important;
  animation: gradientShift 12s ease infinite !important;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 3D flip cards styling */
.cat-card-3d {
  perspective: 1000px;
  height: 380px;
  cursor: pointer;
}
.cat-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;
}
.cat-card-3d:hover .cat-card-inner {
  transform: rotateY(180deg);
}
.cat-card-front, .cat-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}
.cat-card-front {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.cat-card-back {
  transform: rotateY(180deg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  background: linear-gradient(135deg, var(--pink-bg) 0%, #fff 100%);
  overflow-y: auto;
}
.cat-card-3d:hover .cat-card-front {
  border-color: var(--rose-md);
  box-shadow: 0 12px 40px rgba(244,63,94,.12);
}
.cat-card-3d:hover .cat-card-back {
  border-color: var(--rose-md);
  box-shadow: 0 12px 40px rgba(244,63,94,.12);
}
.cat-card-3d:hover .cat-icon {
  transform: scale(1.15) rotate(10deg);
}

/* ══ SECTIONS ══ */`;

if (content.includes(stylesTarget)) {
  content = content.replace(stylesTarget, stylesReplacement);
  console.log("Injected updated CSS styles for 3D flip card, animated hero, and page transitions.");
} else {
  console.error("Could not find style target in index.html!");
}

// 2. Add category dropdown inside search-wrap and typewriter em id, and Trust bar
const searchWrapTarget = `<div class="search-outer">
      <div class="search-glow-wrap">
        <div class="search-wrap">
          <svg class="search-icon" width="20" height="20" fill="none"
               stroke="#6366F1" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            id="searchInput"
            placeholder='Search — "Plumber", "AC Repair", "Home Cleaner"...'
            autocomplete="off"
            oninput="handleSearch(this.value)"
            onkeydown="searchEnter(event)"
          />
          <div class="search-divider"></div>
          <button class="location-btn" onclick="detectLocation()">
            <svg width="14" height="14" fill="none" stroke="currentColor"
                 stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span id="loc-text">Worldwide</span>
          </button>
          <button class="search-btn" onclick="doSearch()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </div>
      <div class="autocomplete" id="autocomplete"></div>
    </div>`;

const searchWrapReplacement = `<div class="search-outer">
      <div class="search-glow-wrap">
        <div class="search-wrap">
          <svg class="search-icon" width="20" height="20" fill="none"
               stroke="#6366F1" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            id="searchInput"
            placeholder='Search — "Plumber", "AC Repair", "Home Cleaner"...'
            autocomplete="off"
            oninput="handleSearch(this.value)"
            onkeydown="searchEnter(event)"
          />
          <div class="search-divider"></div>
          <select id="searchCategory" style="border:none;outline:none;background:transparent;font-size:14px;color:var(--mid);padding:8px;font-family:'DM Sans',sans-serif;cursor:pointer;font-weight:500;">
            <option value="">All Categories</option>
            <option value="Home Repairs">Home Repairs</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Auto Services">Auto & Bike</option>
            <option value="Beauty">Beauty & Salon</option>
            <option value="Logistics & Helpers">Logistics & Helpers</option>
            <option value="Other Local Services">Other Services</option>
          </select>
          <div class="search-divider"></div>
          <button class="location-btn" onclick="detectLocation()">
            <svg width="14" height="14" fill="none" stroke="currentColor"
                 stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span id="loc-text">Near Me</span>
          </button>
          <button class="search-btn" onclick="doSearch()">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </div>
      <div class="autocomplete" id="autocomplete"></div>
    </div>
    
    <!-- Trust Strip Below Hero Search -->
    <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-top:24px;flex-wrap:wrap;font-size:13px;font-weight:600;color:var(--mid);animation:fadeUp .8s .4s ease both;">
      <span>🔒 Verified Workers</span>
      <span style="color:var(--border);">|</span>
      <span>💰 Secure Payments</span>
      <span style="color:var(--border);">|</span>
      <span>⭐ 4.8 Avg Rating</span>
      <span style="color:var(--border);">|</span>
      <span>🌍 120+ Cities</span>
    </div>`;

if (content.includes(searchWrapTarget)) {
  content = content.replace(searchWrapTarget, searchWrapReplacement);
  console.log("Updated Search Bar with Category Dropdown and added Trust Strip.");
} else {
  console.error("Could not find search outer container in index.html!");
}

// 3. Update Hero headline for typewriter target
const headlineTarget = `    <h1>
      Hire Trusted, <em>Verified Professionals</em><br/>
      for Any Task, Instantly &amp; Securely
    </h1>`;
const headlineReplacement = `    <h1>
      Find a <em id="typewriter-text" style="color: var(--rose); font-style: normal; border-right: 2px solid var(--rose); padding-right: 4px;">Plumber...</em><br/>
      Hire Trusted Professionals Near You
    </h1>`;

if (content.includes(headlineTarget)) {
  content = content.replace(headlineTarget, headlineReplacement);
  console.log("Updated Hero Headline with Typewriter text tag.");
} else {
  // Let's check alternative formats
  const altHeadlineTarget = `    <h1>\n      Hire Trusted, <em>Verified Professionals</em><br/>\n      for Any Task, Instantly &amp; Securely\n    </h1>`;
  if (content.includes(altHeadlineTarget)) {
    content = content.replace(altHeadlineTarget, headlineReplacement);
    console.log("Updated Hero Headline (alt) with Typewriter text tag.");
  } else {
    console.error("Could not find Hero Headline in index.html!");
  }
}

// 4. Replace Categories Grid with 3D Flip Card layout
const categoriesGridTarget = `<div class="categories-grid">
    <div class="cat-card" onclick="goCategory('Home Repairs')">
      <div class="cat-header"><div class="cat-icon ic-repair">🔧</div><div><div class="cat-title">Home Repairs</div><div class="cat-count">5+ Services</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Plumber')"><span class="sub-name">🪛 Plumber — Leaks, Pumps, Geysers</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Electrician')"><span class="sub-name">⚡ Electrician — Wiring, Fans, Panels</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Carpenter')"><span class="sub-name">🪚 Carpenter — Furniture, Doors</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Painter')"><span class="sub-name">🖌️ Painter — Interior / Exterior</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('AC Repair')"><span class="sub-name">❄️ AC Repair — Service &amp; Gas Fill</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
    <div class="cat-card" onclick="goCategory('Cleaning')">
      <div class="cat-header"><div class="cat-icon ic-clean">🧹</div><div><div class="cat-title">Home Cleaning</div><div class="cat-count">4+ Services</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Home Cleaning')"><span class="sub-name">🏠 Home Cleaning &amp; Dusting</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Sofa Cleaning')"><span class="sub-name">🛋️ Sofa Deep Cleaning</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Carpet Cleaning')"><span class="sub-name">🔲 Carpet Wash &amp; Clean</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Kitchen Deep Clean')"><span class="sub-name">🍳 Kitchen Grease Removal</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
    <div class="cat-card" onclick="goCategory('Auto Services')">
      <div class="cat-header"><div class="cat-icon ic-auto">🚗</div><div><div class="cat-title">Auto &amp; Bike</div><div class="cat-count">4+ Services</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Car Mechanic')"><span class="sub-name">🔧 Car Repair &amp; Tuning</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Bike Mechanic')"><span class="sub-name">🏍️ Bike Service &amp; Repair</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Car Wash')"><span class="sub-name">🚿 Detail Car Wash at Home</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Roadside Help')"><span class="sub-name">🚨 Emergency Roadside Help</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
    <div class="cat-card" onclick="goCategory('Beauty')">
      <div class="cat-header"><div class="cat-icon ic-beauty">💄</div><div><div class="cat-title">Beauty &amp; Salon</div><div class="cat-count">4+ Services</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Salon at Home')"><span class="sub-name">✂️ Haircut &amp; Facial at Home</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Makeup Artist')"><span class="sub-name">💋 Makeup Artist for Events</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Barber')"><span class="sub-name">💈 Mens Grooming &amp; Shave</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Manicure')"><span class="sub-name">💅 Manicure &amp; Pedicure</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
    <div class="cat-card" onclick="goCategory('Logistics & Helpers')">
      <div class="cat-header"><div class="cat-icon ic-it">🚚</div><div><div class="cat-title">Logistics &amp; Helpers</div><div class="cat-count">4+ Services</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Driver')"><span class="sub-name">🚗 Personal or Commercial Driver</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Mover')"><span class="sub-name">📦 Home Movers &amp; Loaders</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Security Guard')"><span class="sub-name">👮 Private Security Guard</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Helper')"><span class="sub-name">👷 Handyman Helper (Labour)</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
    <div class="cat-card" onclick="goCategory('Other Local Services')">
      <div class="cat-header"><div class="cat-icon ic-other">✨</div><div><div class="cat-title">Other Local Services</div><div class="cat-count">Unlimited</div></div></div>
      <div class="cat-body">
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Chef')"><span class="sub-name">🍳 Cook / Chef at Home</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Gardener')"><span class="sub-name">🌱 Lawn Maintenance &amp; Gardening</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Pest Control')"><span class="sub-name">🦟 Termite &amp; Insect Spray</span><span class="sub-arrow">›</span></div>
        <div class="sub-item" onclick="event.stopPropagation();quickSearch('Custom Task')"><span class="sub-name">🛠️ Custom Local Task</span><span class="sub-arrow">›</span></div>
      </div>
    </div>
  </div>`;

const categoriesGridReplacement = `<div class="categories-grid">
    <!-- Home Repairs Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Home Repairs')">
          <div class="cat-header">
            <div class="cat-icon ic-repair">🔧</div>
            <div>
              <div class="cat-title">Home Repairs</div>
              <div class="cat-count">5+ Services</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Plumber')"><span class="sub-name">🪛 Plumber — Leaks, Pumps, Geysers</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Electrician')"><span class="sub-name">⚡ Electrician — Wiring, Fans, Panels</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Carpenter')"><span class="sub-name">🪚 Carpenter — Furniture, Doors</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Painter')"><span class="sub-name">🖌️ Painter — Interior / Exterior</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('AC Repair')"><span class="sub-name">❄️ AC Repair — Service &amp; Gas Fill</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Home Repairs')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">👨‍🔧</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Ali Raza</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (42 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">⚡</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Usman Khan</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (51 reviews) • Islamabad</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">❄️</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Sajid Mahmood</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (30 reviews) • Karachi</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Home Repairs')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>

    <!-- Home Cleaning Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Cleaning')">
          <div class="cat-header">
            <div class="cat-icon ic-clean">🧹</div>
            <div>
              <div class="cat-title">Home Cleaning</div>
              <div class="cat-count">4+ Services</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Home Cleaning')"><span class="sub-name">🏠 Home Cleaning &amp; Dusting</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Sofa Cleaning')"><span class="sub-name">🛋️ Sofa Deep Cleaning</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Carpet Cleaning')"><span class="sub-name">🔲 Carpet Wash &amp; Clean</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Kitchen Deep Clean')"><span class="sub-name">🍳 Kitchen Grease Removal</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Cleaning')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🧹</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Fatima Bibi</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (88 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🛋️</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Shazia Begum</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.8 (37 reviews) • Karachi</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🧺</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Kamran Shah</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (19 reviews) • Rawalpindi</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Cleaning')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>

    <!-- Auto & Bike Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Auto Services')">
          <div class="cat-header">
            <div class="cat-icon ic-auto">🚗</div>
            <div>
              <div class="cat-title">Auto &amp; Bike</div>
              <div class="cat-count">4+ Services</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Car Mechanic')"><span class="sub-name">🔧 Car Repair &amp; Tuning</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Bike Mechanic')"><span class="sub-name">🏍️ Bike Service &amp; Repair</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Car Wash')"><span class="sub-name">🚿 Detail Car Wash at Home</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Roadside Help')"><span class="sub-name">🚨 Emergency Roadside Help</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Auto Services')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🚗</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Muhammad Bilal</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (63 reviews) • Multan</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🏍️</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Faisal Iqbal</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.7 (24 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🚨</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Tariq Aziz</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (15 reviews) • Karachi</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Auto Services')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>

    <!-- Beauty & Salon Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Beauty')">
          <div class="cat-header">
            <div class="cat-icon ic-beauty">💄</div>
            <div>
              <div class="cat-title">Beauty &amp; Salon</div>
              <div class="cat-count">4+ Services</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Salon at Home')"><span class="sub-name">✂️ Haircut &amp; Facial at Home</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Makeup Artist')"><span class="sub-name">💋 Makeup Artist for Events</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Barber')"><span class="sub-name">💈 Mens Grooming &amp; Shave</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Manicure')"><span class="sub-name">💅 Manicure &amp; Pedicure</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Beauty')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">💄</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Nadia Iqbal</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (72 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">💅</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Sana Mir</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (41 reviews) • Islamabad</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">✂️</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Asif Barber</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.8 (32 reviews) • Karachi</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Beauty')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>

    <!-- Logistics & Helpers Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Logistics & Helpers')">
          <div class="cat-header">
            <div class="cat-icon ic-it">🚚</div>
            <div>
              <div class="cat-title">Logistics &amp; Helpers</div>
              <div class="cat-count">4+ Services</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Driver')"><span class="sub-name">🚗 Personal or Commercial Driver</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Mover')"><span class="sub-name">📦 Home Movers &amp; Loaders</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Security Guard')"><span class="sub-name">👮 Private Security Guard</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Helper')"><span class="sub-name">👷 Handyman Helper (Labour)</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Logistics & Helpers')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🚗</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Imran Khan</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (105 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">📦</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Asad Ali</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.8 (56 reviews) • Karachi</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">👮</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Zaheer Ahmed</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (12 reviews) • Islamabad</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Logistics & Helpers')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>

    <!-- Other Local Services Flip Card -->
    <div class="cat-card-3d">
      <div class="cat-card-inner">
        <div class="cat-card-front" onclick="goCategory('Other Local Services')">
          <div class="cat-header">
            <div class="cat-icon ic-other">✨</div>
            <div>
              <div class="cat-title">Other Local Services</div>
              <div class="cat-count">Unlimited</div>
            </div>
          </div>
          <div class="cat-body">
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Chef')"><span class="sub-name">🍳 Cook / Chef at Home</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Gardener')"><span class="sub-name">🌱 Lawn Maintenance &amp; Gardening</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Pest Control')"><span class="sub-name">🦟 Termite &amp; Insect Spray</span><span class="sub-arrow">›</span></div>
            <div class="sub-item" onclick="event.stopPropagation();quickSearch('Custom Task')"><span class="sub-name">🛠️ Custom Local Task</span><span class="sub-arrow">›</span></div>
          </div>
        </div>
        <div class="cat-card-back" onclick="goCategory('Other Local Services')">
          <h4 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--rose);margin-bottom:14px;border-bottom:2px solid var(--rose-lt);padding-bottom:6px;">⭐ Top Specialists</h4>
          <div style="display:flex;flex-direction:column;gap:12px;flex-grow:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🍳</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Chef Majeed</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.9 (33 reviews) • Lahore</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🌱</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Rasheed Mali</div>
                <div style="font-size:11px;color:var(--muted);">★ 4.8 (21 reviews) • Islamabad</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="font-size:20px;">🦟</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">Zafar Spray</div>
                <div style="font-size:11px;color:var(--muted);">★ 5.0 (17 reviews) • Karachi</div>
              </div>
            </div>
          </div>
          <button onclick="event.stopPropagation();goCategory('Other Local Services')" style="width:100%;padding:10px;background:var(--rose);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:background 0.2s;">View All Experts →</button>
        </div>
      </div>
    </div>
  </div>`;

if (content.includes(categoriesGridTarget)) {
  content = content.replace(categoriesGridTarget, categoriesGridReplacement);
  console.log("Updated Categories Grid with 3D Flip Card layout.");
} else {
  console.error("Could not find categories-grid in index.html!");
}

// 5. Add Trust badges section, Testimonial Carousel section, App Promotion Banner and Cookie consent banner
const trustSectionTarget = `<!-- ══════════════ TRUST SECTION ══════════════ -->
<section class="trust-section reveal" id="about">`;

const trustSectionReplacement = `<!-- ══════════════ WHY CHOOSE DOORSKILL (TRUST BADGES) ══════════════ -->
<section class="trust-badges-section reveal" style="padding: 80px 5%; background: var(--pink-bg); text-align: center;">
  <div style="margin-bottom: 44px;">
    <div class="section-tag">Why Choose Us</div>
    <h2 class="section-title">Safety, Escrow &amp; Trust</h2>
    <p class="section-sub" style="margin: 10px auto 0;">Your security and satisfaction are our core priorities.</p>
  </div>
  <div class="trust-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto;">
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">✅</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">CNIC Verified Identity</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">Every professional is vetted through NADRA CNIC matching and biometrics before approval.</p>
    </div>
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">🔒</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">Secure Payments (Escrow)</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">Your funds are held in secure escrow. The worker gets paid only when you approve the task.</p>
    </div>
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">📞</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">24/7 Local Support</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">Our dedicated support team is online round-the-clock to coordinate and resolve any issues.</p>
    </div>
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">🛡️</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">Satisfaction Guarantee</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">If you are not happy with the quality, we will send another specialist to resolve it for free.</p>
    </div>
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">🏆</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">Top Rated Professionals</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">Only high-performing professionals who maintain a rating above 4.5 remain on our network.</p>
    </div>
    <div class="trust-card" style="text-align: center; padding: 32px 24px; background: #fff; border-radius: 16px; border: 1.5px solid var(--border); transition: all 0.25s; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;">
      <div class="trust-icon" style="font-size: 40px; margin-bottom: 14px;">🌍</div>
      <h3 class="trust-title" style="font-size: 16px; font-weight: 700; color: var(--dark); margin-bottom: 8px;">120+ Cities Covered</h3>
      <p class="trust-desc" style="font-size: 13px; color: var(--muted); line-height: 1.6;">Covering all major urban hubs and suburbs globally and locally across Pakistan.</p>
    </div>
  </div>
</section>

<!-- ══════════════ TESTIMONIALS (CAROUSEL) ══════════════ -->
<section class="testimonials-section reveal" style="padding: 80px 5%; background: #fff; text-align: center;">
  <div style="margin-bottom: 40px;">
    <div class="section-tag">Testimonials</div>
    <h2 class="section-title">What Our Clients Say</h2>
    <p class="section-sub" style="margin: 10px auto 0;">Real feedback from customers who hired through DoorSkill.</p>
  </div>
  <div class="testimonials-carousel" style="position: relative; max-width: 800px; margin: 0 auto; min-height: 200px;">
    <div class="testimonial-slide active" style="text-align: center; display: block; opacity: 1; transition: opacity 0.5s ease-in-out;">
      <p style="font-size: 18px; font-style: italic; color: var(--mid); line-height: 1.8; margin-bottom: 24px;">"DoorSkill is a lifesaver! I needed an emergency plumber at 9 PM in Lahore. Within 15 minutes, a verified plumber arrived and fixed our water pump. Escrow payment gave me total peace of mind."</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid var(--rose-lt); object-fit: cover;">
        <div style="text-align: left;">
          <div style="font-weight: 700; color: var(--dark);">Ahmed Raza</div>
          <div style="font-size: 13px; color: var(--muted);">Lahore, Pakistan • Plumber Service</div>
          <div style="color: #f59e0b; font-size: 12px;">★★★★★</div>
        </div>
      </div>
    </div>
    <div class="testimonial-slide" style="text-align: center; display: none; opacity: 0; transition: opacity 0.5s ease-in-out;">
      <p style="font-size: 18px; font-style: italic; color: var(--mid); line-height: 1.8; margin-bottom: 24px;">"I was skeptical about hiring an electrician online, but the CNIC verification and reviews made me try DoorSkill. The service was top-notch, highly professional and very transparent pricing."</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid var(--rose-lt); object-fit: cover;">
        <div style="text-align: left;">
          <div style="font-weight: 700; color: var(--dark);">Zainab Bibi</div>
          <div style="font-size: 13px; color: var(--muted);">Karachi, Pakistan • Electrician Service</div>
          <div style="color: #f59e0b; font-size: 12px;">★★★★★</div>
        </div>
      </div>
    </div>
    <div class="testimonial-slide" style="text-align: center; display: none; opacity: 0; transition: opacity 0.5s ease-in-out;">
      <p style="font-size: 18px; font-style: italic; color: var(--mid); line-height: 1.8; margin-bottom: 24px;">"As a busy mom, finding a reliable home cleaner was a nightmare. Through DoorSkill, I hired a verified professional who did an outstanding job. Excellent support and very safe platform!"</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid var(--rose-lt); object-fit: cover;">
        <div style="text-align: left;">
          <div style="font-weight: 700; color: var(--dark);">Muhammad Ali</div>
          <div style="font-size: 13px; color: var(--muted);">Islamabad, Pakistan • Cleaning Service</div>
          <div style="color: #f59e0b; font-size: 12px;">★★★★★</div>
        </div>
      </div>
    </div>
  </div>
  <div style="display: flex; justify-content: center; gap: 8px; margin-top: 24px;">
    <span class="carousel-dot active" onclick="setSlide(0)" style="width: 10px; height: 10px; border-radius: 50%; background: var(--rose); cursor: pointer; transition: background 0.3s;"></span>
    <span class="carousel-dot" onclick="setSlide(1)" style="width: 10px; height: 10px; border-radius: 50%; background: var(--border); cursor: pointer; transition: background 0.3s;"></span>
    <span class="carousel-dot" onclick="setSlide(2)" style="width: 10px; height: 10px; border-radius: 50%; background: var(--border); cursor: pointer; transition: background 0.3s;"></span>
  </div>
</section>

<!-- ══════════════ MOBILE APP PROMOTION BANNER ══════════════ -->
<section class="app-section reveal" style="padding: 80px 5%; background: linear-gradient(135deg, var(--dark) 0%, #2d0a1e 100%); color: #fff; overflow: hidden; position: relative;">
  <div style="max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 300px; text-align: left;">
      <span class="section-tag" style="background: rgba(244,63,94,0.15); color: var(--rose-md);">DoorSkill Mobile</span>
      <h2 style="font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; line-height: 1.2; margin-top: 12px; margin-bottom: 18px; color:#fff;">Find Workers on the Go</h2>
      <p style="font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 32px;">Download the DoorSkill app to instantly post jobs, track workers in real-time on GPS, chat securely, and get push notifications right on your phone.</p>
      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="javascript:void(0)" style="display: inline-flex; align-items: center; gap: 8px; background: #000; padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; color: #fff;">
          <span style="font-size: 24px;">🤖</span>
          <div style="text-align: left; line-height: 1.2;">
            <div style="font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.5);">Get it on</div>
            <div style="font-size: 14px; font-weight: 700;">Google Play</div>
          </div>
        </a>
        <a href="javascript:void(0)" style="display: inline-flex; align-items: center; gap: 8px; background: #000; padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; color: #fff;">
          <span style="font-size: 24px;">🍎</span>
          <div style="text-align: left; line-height: 1.2;">
            <div style="font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.5);">Download on the</div>
            <div style="font-size: 14px; font-weight: 700;">App Store</div>
          </div>
        </a>
      </div>
      <div style="margin-top: 24px; font-size: 13px; color: var(--rose-md); font-weight: 600;">🚀 PWA Web App is live — install from your browser search bar!</div>
    </div>
    <div style="flex: 1; min-width: 300px; display: flex; justify-content: center; position: relative;">
      <!-- Pure CSS Phone Mockup -->
      <div class="phone-mockup" style="width: 280px; height: 500px; background: #000; border-radius: 40px; border: 12px solid #222; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; overflow: hidden; outline: 3px solid rgba(255,255,255,0.1);">
        <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 20px; background: #000; border-bottom-left-radius: 15px; z-index: 10; display: flex; align-items: center; justify-content: center;">
          <div style="width: 40px; height: 3px; background: #222; border-radius: 2px; margin-right: 10px;"></div>
          <div style="width: 6px; height: 6px; background: #111; border-radius: 50%;"></div>
        </div>
        <!-- Phone Content -->
        <div style="width: 100%; height: 100%; background: var(--pink-bg); padding: 30px 14px 14px; overflow-y: hidden; color: var(--dark); font-family: sans-serif; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: 900; color: var(--rose); font-size: 16px;">DoorSkill</span>
            <span style="font-size: 10px; background: var(--green-lt); color: var(--green); padding: 1px 5px; border-radius: 20px; font-weight:700;">Active 🟢</span>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 10px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="font-size: 10px; color: var(--muted); font-weight: 600;">CURRENT LOCATION</div>
            <div style="font-size: 12px; font-weight: 700; color: var(--dark); margin-top: 2px;">📍 Gulberg, Lahore</div>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: var(--mid); margin-bottom: 6px;">NEARBY SPECIALISTS</div>
          <div style="background: #fff; border-radius: 8px; padding: 8px; display: flex; gap: 8px; margin-bottom: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); align-items: center;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #ccc; overflow:hidden;"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop" style="width:100%;height:100%;object-fit:cover;"></div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Ali Plumber</div>
              <div style="font-size: 9px; color: var(--rose); font-weight: 600;">Plumbing Specialist</div>
            </div>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 8px; display: flex; gap: 8px; margin-bottom: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); align-items: center;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #ccc; overflow:hidden;"><img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop" style="width:100%;height:100%;object-fit:cover;"></div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Usman Khan</div>
              <div style="font-size: 9px; color: var(--rose); font-weight: 600;">Electrician</div>
            </div>
          </div>
          <div style="background: var(--rose); color: #fff; border-radius: 8px; padding: 10px; text-align: center; font-weight: 700; font-size: 12px; margin-top: 14px; box-shadow: 0 4px 12px rgba(244,63,94,0.3);">Post a Job Request</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- GDPR COOKIE CONSENT BANNER -->
<div id="cookieBanner" style="position: fixed; bottom: 20px; left: 20px; right: 20px; max-width: 450px; background: rgba(26,10,20,0.95); backdrop-filter: blur(10px); color: #fff; padding: 20px; border-radius: 16px; border: 1.5px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 10002; display: none; flex-direction: column; gap: 12px; text-align: left;">
  <div style="font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px;">🍪 Privacy &amp; Cookies</div>
  <div style="font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.5;">We use cookies to improve your browsing experience, display personalized ads, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</div>
  <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
    <button onclick="acceptCookies()" style="background: var(--rose); border: none; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.2s;">Accept All</button>
    <button onclick="rejectCookies()" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; transition: border-color 0.2s;">Decline</button>
  </div>
</div>

<!-- ══════════════ TRUST SECTION ══════════════ -->
<section class="trust-section reveal" id="about">`;

if (content.includes(trustSectionTarget)) {
  content = content.replace(trustSectionTarget, trustSectionReplacement);
  console.log("Injected Trust badges, Carousel testimonials, App mockup section, and GDPR Cookie banner.");
} else {
  console.error("Could not find trust section in index.html!");
}

// 6. Inect Scroll-to-Top Button, Typewriter Script, Stats Scroll animate, Testimonials AutoRotate script, and Cookie scripts into script block
const scriptCloseTarget = `</script>
<script type="module" src="assets/notifications.js"></script>`;

const scriptCloseReplacement = `
/* ── Typewriter Headline Effect ── */
const typewriterWords = ["Plumber...", "Electrician...", "Cleaner...", "AC Mechanic...", "Verified Professional..."];
let typewriterWordIdx = 0;
let typewriterCharIdx = 0;
let typewriterIsDeleting = false;
const typewriterTargetEl = document.getElementById('typewriter-text');
function typeEffect() {
  const currentWord = typewriterWords[typewriterWordIdx];
  if (typewriterIsDeleting) {
    typewriterTargetEl.innerHTML = currentWord.substring(0, typewriterCharIdx - 1);
    typewriterCharIdx--;
  } else {
    typewriterTargetEl.innerHTML = currentWord.substring(0, typewriterCharIdx + 1);
    typewriterCharIdx++;
  }
  
  let typingSpeed = typewriterIsDeleting ? 40 : 100;
  
  if (!typewriterIsDeleting && typewriterCharIdx === currentWord.length) {
    typingSpeed = 1500; // pause at full word
    typewriterIsDeleting = true;
  } else if (typewriterIsDeleting && typewriterCharIdx === 0) {
    typewriterIsDeleting = false;
    typewriterWordIdx = (typewriterWordIdx + 1) % typewriterWords.length;
    typingSpeed = 500; // pause before next word
  }
  
  setTimeout(typeEffect, typingSpeed);
}
if (typewriterTargetEl) setTimeout(typeEffect, 1000);

/* ── Value Animate (Count Up) ── */
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const val = Math.floor(progress * (end - start) + start);
    obj.innerHTML = val.toLocaleString() + (end === 12000 || end === 45000 || end === 120 ? '+' : '');
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const wEl = document.getElementById('ps-workers');
      const jEl = document.getElementById('ps-jobs');
      const swEl = document.getElementById('stat-workers');
      const sjEl = document.getElementById('stat-jobs');
      
      if (wEl) animateValue(wEl, 0, 12000, 1500);
      if (jEl) animateValue(jEl, 0, 45000, 1500);
      if (swEl) animateValue(swEl, 0, 12000, 1500);
      if (sjEl) animateValue(sjEl, 0, 45000, 1500);
      
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.2 });

const statsStripEl = document.querySelector('.stats-strip');
if (statsStripEl) statsObserver.observe(statsStripEl);

/* ── Testimonial Slider & Auto-Rotate ── */
let currentSlideIdx = 0;
window.setSlide = function(idx) {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  if (slides.length === 0) return;
  slides.forEach((slide, i) => {
    if (i === idx) {
      slide.style.display = 'block';
      setTimeout(() => { slide.style.opacity = 1; }, 20);
    } else {
      slide.style.opacity = 0;
      slide.style.display = 'none';
    }
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  currentSlideIdx = idx;
};
function autoRotateTestimonials() {
  setInterval(() => {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length === 0) return;
    let next = (currentSlideIdx + 1) % slides.length;
    window.setSlide(next);
  }, 5000);
}
autoRotateTestimonials();

/* ── GDPR Consent Cookie Banner ── */
if (!localStorage.getItem('cookiesAccepted')) {
  document.getElementById('cookieBanner').style.display = 'flex';
}
window.acceptCookies = function() {
  localStorage.setItem('cookiesAccepted', 'true');
  document.getElementById('cookieBanner').style.display = 'none';
};
window.rejectCookies = function() {
  localStorage.setItem('cookiesAccepted', 'false');
  document.getElementById('cookieBanner').style.display = 'none';
};

/* ── Floating Scroll-to-Top Button ── */
const scrollBtn = document.createElement('button');
scrollBtn.id = 'scrollToTopBtn';
scrollBtn.innerHTML = '↑';
scrollBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 48px; height: 48px; border-radius: 50%; background: var(--rose); color: #fff; border: none; font-size: 20px; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(244,63,94,0.3); z-index: 9999; transition: all 0.3s ease;';
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollBtn.style.display = 'flex';
  } else {
    scrollBtn.style.display = 'none';
  }
});
scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

</script>
<script type="module" src="assets/notifications.js"></script>`;

if (content.includes(scriptCloseTarget)) {
  content = content.replace(scriptCloseTarget, scriptCloseReplacement);
  console.log("Injected typewriter, counter animate, testimonials slider, cookie, and scroll-to-top JS code.");
} else {
  console.error("Could not find scripts block end in index.html!");
}

// Write the changes back to index.html
fs.writeFileSync(filePath, content, 'utf8');
console.log("HOMEPAGE UPDATE COMPLETED SUCCESSFULLY!");
