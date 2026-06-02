const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/find-workers.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r?\n/g, '\n');

// 1. Inject Styles for Accordion, Compare Bar, Modal and Bookmarks
const stylesTarget = `/* ═══ MOBILE ═══ */`;
const stylesReplacement = `
/* Collapsible Accordion & Premium Filter styling */
.filter-group {
  border-bottom: 1px solid var(--border);
  padding: 12px 14px;
}
.filter-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  color: var(--dark);
}
.filter-group-content {
  display: block;
  margin-top: 8px;
}
.filter-group.collapsed .filter-group-content {
  display: none;
}
.acc-arrow {
  font-size: 10px;
  color: var(--rose);
  transition: transform 0.2s;
}

/* Page Transition animation */
@keyframes fadeInPage {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
body {
  animation: fadeInPage 0.4s ease-out both;
}

/* ═══ MOBILE ═══ */`;

if (content.includes(stylesTarget)) {
  content = content.replace(stylesTarget, stylesReplacement);
  console.log("Injected Find-Workers CSS modifications.");
} else {
  console.error("Could not find style target in find-workers.html!");
}

// 2. Replace the filter bar HTML block with collapsible accordion structure
const filterBarTarget = `    <!-- Filters -->
    <div class="filter-bar">
      <div class="cat-row" id="catRow">
        <div class="cat-chip active" onclick="setCat('',this)">All</div>
        <div class="cat-chip" onclick="setCat('Home Repairs',this)">🔧 Repairs</div>
        <div class="cat-chip" onclick="setCat('Cleaning',this)">🧹 Cleaning</div>
        <div class="cat-chip" onclick="setCat('Auto Services',this)">🚗 Auto &amp; Bike</div>
        <div class="cat-chip" onclick="setCat('Beauty',this)">💄 Beauty</div>
        <div class="cat-chip" onclick="setCat('Logistics & Helpers',this)">🚚 Logistics</div>
        <div class="cat-chip" onclick="setCat('Other Local Services',this)">✨ Other</div>
      </div>
      <div class="filter-row">
        <select class="fsel" id="sortSel" onchange="applyFilters()">
          <option value="rating">⭐ Top Rated</option>
          <option value="reviews">📊 Most Reviews</option>
          <option value="price-low">💰 Price ↑</option>
          <option value="price-high">💰 Price ↓</option>
          <option value="newest">🆕 Newest</option>
        </select>
        <select class="fsel" id="statusSel" onchange="applyFilters()">
          <option value="">All Status</option>
          <option value="online">🟢 Online Now</option>
          <option value="verified">✅ Verified Only</option>
        </select>
        <select class="fsel" id="priceSel" onchange="applyFilters()">
          <option value="">Any Price</option>
          <option value="0-500">Under Rs.500</option>
          <option value="500-2000">Rs.500–2K</option>
          <option value="2000-10000">Rs.2K–10K</option>
          <option value="10000+">Rs.10K+</option>
        </select>
      </div>
    </div>`;

const filterBarReplacement = `    <!-- Collapsible Accordion Filters -->
    <div class="filter-bar" style="padding: 0; background: #fff;">
      <!-- Category Accordion -->
      <div class="filter-group">
        <div class="filter-group-header" onclick="toggleAccordion(this)">
          <span>📂 Categories</span>
          <span class="acc-arrow">▼</span>
        </div>
        <div class="filter-group-content">
          <div class="cat-row" id="catRow" style="padding: 4px 0 4px; display: flex; flex-wrap: wrap; gap: 6px;">
            <div class="cat-chip active" onclick="setCat('',this)">All</div>
            <div class="cat-chip" onclick="setCat('Home Repairs',this)">🔧 Repairs</div>
            <div class="cat-chip" onclick="setCat('Cleaning',this)">🧹 Cleaning</div>
            <div class="cat-chip" onclick="setCat('Auto Services',this)">🚗 Auto &amp; Bike</div>
            <div class="cat-chip" onclick="setCat('Beauty',this)">💄 Beauty</div>
            <div class="cat-chip" onclick="setCat('Logistics & Helpers',this)">🚚 Logistics</div>
            <div class="cat-chip" onclick="setCat('Other Local Services',this)">✨ Other</div>
          </div>
        </div>
      </div>
      
      <!-- Sort & Status Accordion -->
      <div class="filter-group">
        <div class="filter-group-header" onclick="toggleAccordion(this)">
          <span>⚡ Sort &amp; Status</span>
          <span class="acc-arrow">▼</span>
        </div>
        <div class="filter-group-content">
          <div class="filter-row" style="padding: 4px 0; display: flex; gap: 8px;">
            <select class="fsel" id="sortSel" onchange="applyFilters()">
              <option value="rating">⭐ Top Rated</option>
              <option value="reviews">📊 Most Reviews</option>
              <option value="price-low">💰 Price ↑</option>
              <option value="price-high">💰 Price ↓</option>
              <option value="newest">🆕 Newest</option>
            </select>
            <select class="fsel" id="statusSel" onchange="applyFilters()">
              <option value="">All Status</option>
              <option value="online">🟢 Online Now</option>
              <option value="verified">✅ Verified Only</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Price & Favorites Accordion -->
      <div class="filter-group">
        <div class="filter-group-header" onclick="toggleAccordion(this)">
          <span>💰 Rates &amp; Preferences</span>
          <span class="acc-arrow">▼</span>
        </div>
        <div class="filter-group-content">
          <div style="padding: 4px 0; display:flex; flex-direction:column; gap:12px;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--dark); margin-bottom:4px;">
                <span>Max Rate limit:</span>
                <span id="rateLabel">Rs. 10,000</span>
              </div>
              <input type="range" id="rateSlider" min="0" max="10000" step="250" value="10000" oninput="updateRateLabel(this.value); applyFilters();" style="width:100%; accent-color:var(--rose);">
            </div>
            <div style="display:flex; gap:16px; align-items:center;">
              <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--mid); cursor:pointer;">
                <input type="checkbox" id="favOnlyCheck" onchange="applyFilters()" style="cursor:pointer; width:15px; height:15px; accent-color:var(--rose);">
                ❤️ Saved Only
              </label>
              <label style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--mid); cursor:pointer;">
                <input type="checkbox" id="verifiedOnlyCheck" onchange="applyFilters()" style="cursor:pointer; width:15px; height:15px; accent-color:var(--rose);">
                ✅ Verified Only
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>`;

if (content.includes(filterBarTarget)) {
  content = content.replace(filterBarTarget, filterBarReplacement);
  console.log("Replaced filter bar HTML with collapsible accordions.");
} else {
  console.error("Could not find filter-bar target in find-workers.html!");
}

// 3. Inject bottom comparison bar and comparison modal
const drawerOverlayTarget = `<!-- ═══ DRAWER ═══ -->
<div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>`;

const comparisonReplacement = `<!-- ⚖️ COMPARISON BAR ⚖️ -->
<div id="compareBar" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(26,10,20,0.96); backdrop-filter: blur(10px); color: #fff; padding: 14px 24px; display: none; align-items: center; justify-content: space-between; z-index: 10001; box-shadow: 0 -10px 30px rgba(0,0,0,0.2); border-top: 1.5px solid rgba(255,255,255,0.1);">
  <div style="display: flex; align-items: center; gap: 16px;">
    <span style="font-weight: 700; font-size: 14px;">⚖️ Compare Specialists (<span id="compareCount">0</span>/3)</span>
    <div id="compareThumbnails" style="display: flex; gap: 8px;"></div>
  </div>
  <div style="display: flex; gap: 10px;">
    <button onclick="openCompareModal()" style="background: var(--rose); color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.2s;">Compare Now</button>
    <button onclick="clearComparison()" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.3); padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;">Clear All</button>
  </div>
</div>

<!-- COMPARISON MODAL -->
<div id="compareModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10002; display: none; align-items: center; justify-content: center; padding: 20px;">
  <div style="background: #fff; width: 100%; max-width: 800px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
    <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--pink-bg);">
      <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: var(--dark);">⚖️ Compare Professionals</h3>
      <button onclick="closeCompareModal()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--rose);">✕</button>
    </div>
    <div style="padding: 20px; overflow-x: auto; flex-grow: 1;">
      <table style="width: 100%; border-collapse: collapse; min-width: 500px; text-align: left;">
        <thead>
          <tr id="compareTHead" style="border-bottom: 2px solid var(--border);">
            <th style="padding: 12px; color: var(--muted); font-size: 13px; border:1px solid var(--border);">Feature</th>
          </tr>
        </thead>
        <tbody id="compareTBody">
          <!-- Rows will be injected -->
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ═══ DRAWER ═══ -->
<div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>`;

if (content.includes(drawerOverlayTarget)) {
  content = content.replace(drawerOverlayTarget, comparisonReplacement);
  console.log("Injected bottom comparison bar and side-by-side modal.");
} else {
  console.error("Could not find drawer-overlay target in find-workers.html!");
}

// 4. Replace cardHTML function to support bookmarking, comparison checkbox, and actions layout
const cardHTMLTarget = `function cardHTML(w){
  const stars   = Math.min(5, Math.round(w.rating || 0));
  const sh      = '★'.repeat(stars) + '☆'.repeat(5-stars);
  const skills  = (w.skills||[]).slice(0,3).map(s=>
    \`<span class="stag">\${s}</span>\`).join('');
  const currency= currencyFor(w.country);
  const rate    = \`\${currency}\${(w.rate||0).toLocaleString()}\`;
  const emoji   = categoryEmoji(w.category);

  return \`
  <div class="wcard" id="card-\${w.id}" onclick="selectWorker('\${w.id}')">
    <div class="wc-top">
      <div class="wc-avatar">
        \${w.photoURL ? \`<img src="\${w.photoURL}" alt="\${w.fullName}"/>\` : emoji}
        \${w.isOnline ? '<div class="online-dot"></div>' : ''}
      </div>
      <div class="wc-info">
        <div class="wc-name">
          \${w.fullName || 'Worker'}
          \${w.status==='active' ? '<span class="v-badge">✅ Verified</span>' : ''}
        </div>
        <div class="wc-cat">\${w.category || 'Service Provider'}</div>
        <div class="wc-rating">
          <span class="stars">\${sh}</span>
          \${(w.rating||0).toFixed(1)}
          <span style="color:var(--muted)">(\${w.totalReviews||0})</span>
        </div>
      </div>
      <div class="wc-price-wrap">
        <div class="wc-price">\${rate}</div>
        <div class="wc-price-type">\${w.rateType||'Per Job'}</div>
      </div>
    </div>
    <div class="skill-tags">\${skills}</div>
    <div class="wc-loc">
      📍 \${w.city||''}, \${w.country||'Pakistan'}
      \${w.isOnline
        ? ' &bull; <span style="color:var(--green);font-weight:600;">🟢 Online</span>'
        : ' &bull; <span style="color:var(--muted);">⚫ Offline</span>'}
    </div>
    <div class="wc-actions">
      <button class="wbtn wbtn-primary"
              onclick="event.stopPropagation();goChat('\${w.id}')">
        💬 Chat
      </button>
      <button class="wbtn wbtn-green"
              onclick="event.stopPropagation();goHire('\${w.id}')">
        ✅ Hire
      </button>
      <button class="wbtn wbtn-outline"
              onclick="event.stopPropagation();flyToWorker('\${w.id}')">
        📍 Map
      </button>
    </div>
  </div>\`;
}`;

const cardHTMLReplacement = `function cardHTML(w){
  const stars   = Math.min(5, Math.round(w.rating || 0));
  const sh      = '★'.repeat(stars) + '☆'.repeat(5-stars);
  const skills  = (w.skills||[]).slice(0,3).map(s=>
    \`<span class="stag">\${s}</span>\`).join('');
  const currency= currencyFor(w.country);
  const rate    = \`\${currency}\${(w.rate||0).toLocaleString()}\`;
  const emoji   = categoryEmoji(w.category);
  
  const isFav = isBookmarked(w.id);
  const isComparedChecked = window._comparedIds && window._comparedIds.includes(w.id) ? 'checked' : '';

  return \`
  <div class="wcard" id="card-\${w.id}" onclick="selectWorker('\${w.id}')" style="position:relative;">
    <!-- Bookmark Toggle -->
    <button class="bookmark-btn" onclick="event.stopPropagation(); toggleBookmark('\${w.id}', this)" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 20px; cursor: pointer; transition: transform 0.2s; z-index: 5;">
      \${isFav ? '❤️' : '🤍'}
    </button>
    
    <div class="wc-top" style="padding-right: 24px;">
      <div class="wc-avatar">
        \${w.photoURL ? \`<img src="\${w.photoURL}" alt="\${w.fullName}"/>\` : emoji}
        \${w.isOnline ? '<div class="online-dot"></div>' : ''}
      </div>
      <div class="wc-info">
        <div class="wc-name">
          \${w.fullName || 'Worker'}
          \${w.status==='active' ? '<span class="v-badge">✅ Verified</span>' : ''}
        </div>
        <div class="wc-cat">\${w.category || 'Service Provider'}</div>
        <div class="wc-rating">
          <span class="stars">\${sh}</span>
          \${(w.rating||0).toFixed(1)}
          <span style="color:var(--muted)">(\${w.totalReviews||0})</span>
        </div>
      </div>
      <div class="wc-price-wrap">
        <div class="wc-price">\${rate}</div>
        <div class="wc-price-type">\${w.rateType||'Per Job'}</div>
      </div>
    </div>
    <div class="skill-tags">\${skills}</div>
    <div class="wc-loc">
      📍 \${w.city||''}, \${w.country||'Pakistan'}
      \${w.isOnline
        ? ' &bull; <span style="color:var(--green);font-weight:600;">🟢 Online</span>'
        : ' &bull; <span style="color:var(--muted);">⚫ Offline</span>'}
    </div>
    
    <!-- Compare check and Actions -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; gap:8px;">
      <label onclick="event.stopPropagation()" style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:var(--mid); cursor:pointer;">
        <input type="checkbox" class="compare-check" onchange="toggleCompare('\${w.id}', this)" \${isComparedChecked} style="cursor:pointer; width:15px; height:15px; accent-color:var(--rose);">
        Compare
      </label>
      <div class="wc-actions" style="flex:1; justify-content:flex-end;">
        <button class="wbtn wbtn-primary" style="padding:6px 12px; font-size:11px;"
                onclick="event.stopPropagation();goChat('\${w.id}')">
          💬 Chat
        </button>
        <button class="wbtn wbtn-green" style="padding:6px 12px; font-size:11px;"
                onclick="event.stopPropagation();goHire('\${w.id}')">
          ✅ Hire
        </button>
      </div>
    </div>
  </div>\`;
}`;

if (content.includes(cardHTMLTarget)) {
  content = content.replace(cardHTMLTarget, cardHTMLReplacement);
  console.log("Replaced cardHTML function.");
} else {
  console.error("Could not find cardHTML target in find-workers.html!");
}

// 5. Replace renderCards with client-side infinite scroll logic
const renderCardsTarget = `window.renderCards = (workers) => {
  const el = document.getElementById('workersList');
  const n  = workers.length;
  document.getElementById('resCount').textContent =
    n > 0 ? \`\${n} Worker\${n!==1?'s':''} Found\` : 'No Workers Found';

  if(n === 0){
    el.innerHTML = \`
      <div class="no-results">
        <div class="nr-icon">🔍</div>
        <div class="nr-title">No workers match your search</div>
        <div class="nr-sub">
          Try different keywords or clear filters.<br/>
          Or <a href="../pages/post-job.html" style="color:var(--rose);font-weight:600;">post a job</a>
          and let workers come to you!
        </div>
      </div>\`;
    return;
  }
  el.innerHTML = workers.map(cardHTML).join('');
};`;

const renderCardsReplacement = `let currentLimit = 10;
window.renderCards = (workers) => {
  const el = document.getElementById('workersList');
  const n  = workers.length;
  document.getElementById('resCount').textContent =
    n > 0 ? \`\${n} Worker\${n!==1?'s':''} Found\` : 'No Workers Found';

  if(n === 0){
    el.innerHTML = \`
      <div class="no-results">
        <div class="nr-icon">🔍</div>
        <div class="nr-title">No workers match your search</div>
        <div class="nr-sub">
          Try different keywords or clear filters.<br/>
          Or <a href="../pages/post-job.html" style="color:var(--rose);font-weight:600;">post a job</a>
          and let workers come to you!
        </div>
      </div>\`;
    return;
  }
  
  // Initial batch load
  currentLimit = 10;
  el.innerHTML = '';
  appendBatch(workers.slice(0, currentLimit));
  
  // Hook up infinite scroll listener on the list container
  el.onscroll = () => {
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      if (currentLimit < workers.length) {
        const nextBatch = workers.slice(currentLimit, currentLimit + 10);
        appendBatch(nextBatch);
        currentLimit += 10;
      }
    }
  };
};

function appendBatch(batch) {
  const el = document.getElementById('workersList');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = batch.map(cardHTML).join('');
  while (tempDiv.firstChild) {
    el.appendChild(tempDiv.firstChild);
  }
}`;

if (content.includes(renderCardsTarget)) {
  content = content.replace(renderCardsTarget, renderCardsReplacement);
  console.log("Injected client-side infinite scroll rendering logic.");
} else {
  console.error("Could not find renderCards function in find-workers.html!");
}

// 6. Update applyFilters function to handle rate slider, bookmarks (favorites) and verified checkbox
const applyFiltersTarget = `window.applyFilters = () => {
  const skill  = document.getElementById('skillInput').value.trim().toLowerCase();
  const sort   = document.getElementById('sortSel').value;
  const status = document.getElementById('statusSel').value;
  const price  = document.getElementById('priceSel').value;
  const cat    = window._selCat;

  let list = [...window._all];

  if(skill){
    list = list.filter(w => {
      const t = [(w.fullName||''),(w.category||''),...(w.skills||[])].join(' ').toLowerCase();
      return t.includes(skill);
    });
  }
  if(cat){
    list = list.filter(w => (w.category||'').toLowerCase().includes(cat.toLowerCase()));
  }
  if(status === 'online')    list = list.filter(w => w.isOnline);
  if(status === 'verified')  list = list.filter(w => w.status === 'active');

  if(price){
    if(price === '10000+'){
      list = list.filter(w => (w.rate||0) >= 10000);
    } else {
      const [mn, mx] = price.split('-').map(Number);
      list = list.filter(w => { const r = w.rate||0; return r >= mn && r <= (mx||Infinity); });
    }
  }

  if(sort === 'rating')     list.sort((a,b) => (b.rating||0)-(a.rating||0));
  if(sort === 'reviews')    list.sort((a,b) => (b.totalReviews||0)-(a.totalReviews||0));
  if(sort === 'price-low')  list.sort((a,b) => (a.rate||0)-(b.rate||0));
  if(sort === 'price-high') list.sort((a,b) => (b.rate||0)-(a.rate||0));

  window._filtered = list;
  renderCards(list);
  plotMarkers(list);
  updateStats(list);
};`;

const applyFiltersReplacement = `window.applyFilters = () => {
  const skill  = document.getElementById('skillInput').value.trim().toLowerCase();
  const sort   = document.getElementById('sortSel').value;
  const status = document.getElementById('statusSel').value;
  const maxRate = parseInt(document.getElementById('rateSlider').value || '10000');
  const favOnly = document.getElementById('favOnlyCheck').checked;
  const verifiedOnly = document.getElementById('verifiedOnlyCheck').checked;
  const cat    = window._selCat;

  let list = [...window._all];

  if(skill){
    list = list.filter(w => {
      const t = [(w.fullName||''),(w.category||''),...(w.skills||[])].join(' ').toLowerCase();
      return t.includes(skill);
    });
  }
  if(cat){
    list = list.filter(w => (w.category||'').toLowerCase().includes(cat.toLowerCase()));
  }
  if(status === 'online')    list = list.filter(w => w.isOnline);
  if(status === 'verified' || verifiedOnly)  list = list.filter(w => w.status === 'active');

  // Rate Slider Filter
  list = list.filter(w => (w.rate || 0) <= maxRate);

  // Favorites (Bookmarks) filter
  if(favOnly) {
    const favs = getBookmarks();
    list = list.filter(w => favs.includes(w.id));
  }

  if(sort === 'rating')     list.sort((a,b) => (b.rating||0)-(a.rating||0));
  if(sort === 'reviews')    list.sort((a,b) => (b.totalReviews||0)-(a.totalReviews||0));
  if(sort === 'price-low')  list.sort((a,b) => (a.rate||0)-(b.rate||0));
  if(sort === 'price-high') list.sort((a,b) => (b.rate||0)-(a.rate||0));

  window._filtered = list;
  renderCards(list);
  plotMarkers(list);
  updateStats(list);
};`;

if (content.includes(applyFiltersTarget)) {
  content = content.replace(applyFiltersTarget, applyFiltersReplacement);
  console.log("Updated applyFilters logic for sliders, verification checkboxes, and bookmarks.");
} else {
  console.error("Could not find applyFilters function in find-workers.html!");
}

// 7. Inject Bookmarks, Comparison, and Accordion helper scripts at the end of the script block
const helpersTarget = `window.toggleSidebar = () => {
  document.getElementById('sidebar').classList.toggle('mobile-open');
};`;

const helpersReplacement = `window.toggleSidebar = () => {
  document.getElementById('sidebar').classList.toggle('mobile-open');
};

/* ── Bookmark logic ── */
window.getBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem('ds_bookmarks') || '[]');
  } catch(e) {
    return [];
  }
};
window.isBookmarked = (id) => {
  return getBookmarks().includes(id);
};
window.toggleBookmark = (id, btn) => {
  let list = getBookmarks();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    btn.innerHTML = '🤍';
    showToast('Removed from Bookmarks');
  } else {
    list.push(id);
    btn.innerHTML = '❤️';
    showToast('Added to Bookmarks');
  }
  localStorage.setItem('ds_bookmarks', JSON.stringify(list));
  applyFilters();
};

/* ── Accordion logic ── */
window.toggleAccordion = (headerEl) => {
  const group = headerEl.parentElement;
  group.classList.toggle('collapsed');
  const arrow = headerEl.querySelector('.acc-arrow');
  if (group.classList.contains('collapsed')) {
    arrow.textContent = '▶';
  } else {
    arrow.textContent = '▼';
  }
};

/* ── Rate Slider Label ── */
window.updateRateLabel = (val) => {
  document.getElementById('rateLabel').textContent = 'Rs. ' + parseInt(val).toLocaleString();
};

/* ── Compare logic ── */
window._comparedIds = [];
window.toggleCompare = (id, chk) => {
  if (chk.checked) {
    if (window._comparedIds.length >= 3) {
      chk.checked = false;
      showToast('❌ Compare max 3 professionals');
      return;
    }
    if (!window._comparedIds.includes(id)) {
      window._comparedIds.push(id);
    }
  } else {
    window._comparedIds = window._comparedIds.filter(x => x !== id);
  }
  updateCompareBar();
};

window.updateCompareBar = () => {
  const bar = document.getElementById('compareBar');
  const countEl = document.getElementById('compareCount');
  const thumbsEl = document.getElementById('compareThumbnails');
  
  if (window._comparedIds.length > 0) {
    bar.style.display = 'flex';
    countEl.textContent = window._comparedIds.length;
    
    thumbsEl.innerHTML = window._comparedIds.map(id => {
      const w = window._all.find(x => x.id === id);
      const emoji = categoryEmoji(w?.category);
      return \`
        <div style="position:relative; width:32px; height:32px; border-radius:50%; border:2px solid var(--rose); background:#fff; overflow:hidden;" title="\${w?.fullName || 'Worker'}">
          \${w?.photoURL ? \`<img src="\${w.photoURL}" style="width:100%;height:100%;object-fit:cover;">\` : \`<div style="font-size:12px;display:flex;align-items:center;justify-content:center;height:100%;height:32px;">\${emoji}</div>\`}
        </div>
      \`;
    }).join('');
  } else {
    bar.style.display = 'none';
  }
};

window.clearComparison = () => {
  window._comparedIds = [];
  document.querySelectorAll('.compare-check').forEach(chk => chk.checked = false);
  updateCompareBar();
};

window.openCompareModal = () => {
  const modal = document.getElementById('compareModal');
  const thead = document.getElementById('compareTHead');
  const tbody = document.getElementById('compareTBody');
  
  if (window._comparedIds.length === 0) return;
  
  const workers = window._comparedIds.map(id => window._all.find(x => x.id === id));
  
  // Create table head
  thead.innerHTML = \`
    <th style="padding: 12px; border:1px solid var(--border); background: #fafafa; font-weight:700; font-size:13px; color:var(--dark);">Feature</th>
    \${workers.map(w => {
      const emoji = categoryEmoji(w?.category);
      return \`
        <th style="padding: 12px; border:1px solid var(--border); text-align:center; background:#fff;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
            <div style="width:50px; height:50px; border-radius:50%; border:2px solid var(--rose); overflow:hidden; background:var(--pink-bg); display:flex; align-items:center; justify-content:center; font-size:22px; position:relative;">
              \${w.photoURL ? \`<img src="\${w.photoURL}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">\` : emoji}
            </div>
            <div style="font-size:13px; font-weight:700; color:var(--dark);">\${w.fullName}</div>
            <div style="font-size:10px; color:var(--rose); text-transform:uppercase; font-weight:700;">\${w.category || 'Specialist'}</div>
          </div>
        </th>
      \`;
    }).join('')}
  \`;
  
  // Compare rows
  const features = [
    { name: 'Rating', fn: w => \`⭐ \${(w.rating || 0).toFixed(1)} (\${w.totalReviews || 0} reviews)\` },
    { name: 'Hourly Rate', fn: w => \`\${currencyFor(w.country)}\${(w.rate || 0).toLocaleString()} / \${w.rateType || 'Per Job'}\` },
    { name: 'Location', fn: w => \`📍 \${w.city || ''}, \${w.country || ''}\` },
    { name: 'Verified Badge', fn: w => w.status === 'active' || w.cnicVerified ? '✅ Verified Specialist' : '❌ Standard Profile' },
    { name: 'Online Status', fn: w => w.isOnline ? '🟢 Online' : '⚫ Offline' },
    { name: 'Key Skills', fn: w => (w.skills || []).join(', ') || 'None listed' }
  ];
  
  tbody.innerHTML = features.map((f, idx) => \`
    <tr style="background:\${idx % 2 === 0 ? '#fff' : '#fcfcfc'};">
      <td style="padding: 12px; border:1px solid var(--border); font-weight:700; font-size:12px; color:var(--mid);">\${f.name}</td>
      \${workers.map(w => \`
        <td style="padding: 12px; border:1px solid var(--border); text-align:center; font-size:12px; color:var(--dark);">\${f.fn(w)}</td>
      \`).join('')}
    </tr>
  \`).join('');
  
  modal.style.display = 'flex';
};

window.closeCompareModal = () => {
  document.getElementById('compareModal').style.display = 'none';
};`;

if (content.includes(helpersTarget)) {
  content = content.replace(helpersTarget, helpersReplacement);
  console.log("Added Bookmarks, comparison modal and accordion JS helpers.");
} else {
  console.error("Could not find helpers target in find-workers.html!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("FIND-WORKERS UPDATE COMPLETED SUCCESSFULLY!");
