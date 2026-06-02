const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/post-job.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Restore Step 1 structure and Categories Grid
const targetRegex = /<div class="page-wrap">[\s\r\n]*<button class="btn-next" onclick="v1\(\)">/;
const replacement = `<div class="page-wrap">

  <!-- Progress -->
  <div class="progress-bar-wrap" id="progressWrap">
    <div class="progress-title">Post a Job 📋</div>
    <div class="progress-sub">
      Fill in details — workers near you will be notified instantly
    </div>
    <div class="steps-bar">
      <div class="sbar-dot active" id="sd1">1</div>
      <div class="sbar-line"       id="sl1"></div>
      <div class="sbar-dot"        id="sd2">2</div>
      <div class="sbar-line"       id="sl2"></div>
      <div class="sbar-dot"        id="sd3">3</div>
      <div class="sbar-line"       id="sl3"></div>
      <div class="sbar-dot"        id="sd4">4</div>
    </div>
    <div class="sbar-labels">
      <span class="active" id="slbl1">Category</span>
      <span id="slbl2">Details</span>
      <span id="slbl3">Budget</span>
      <span id="slbl4">Location</span>
    </div>
  </div>

  <!-- Success Screen -->
  <div class="success-wrap" id="successWrap">
    <div class="s-icon">🎉</div>
    <div class="s-title">Job Posted Successfully!</div>
    <p class="s-sub">
      Your job is now live. Verified workers near you
      have been notified and will start sending bids shortly.
    </p>
    <div class="s-info">
      <div class="s-info-item">
        <span>📋</span> Job posted & live
      </div>
      <div class="s-info-item">
        <span>🔔</span> Nearby workers notified instantly
      </div>
      <div class="s-info-item">
        <span>📬</span> Check bids in your dashboard
      </div>
      <div class="s-info-item">
        <span>✅</span> Accept best bid & start chatting
      </div>
    </div>
    <div class="s-actions">
      <a href="../dashboard/client.html" class="s-btn-primary">📬 View Bids →</a>
      <a href="post-job.html" class="s-btn-outline">➕ Post Another Job</a>
    </div>
  </div>

  <!-- Two Col -->
  <div class="two-col" id="formWrap">

    <!-- LEFT — FORM -->
    <div>

      <!-- STEP 1 - CATEGORY -->
      <div class="fstep active" id="step1">
        <div class="form-card">
          <div class="step-header">
            <h3>📂 What do you need?</h3>
            <p>Select a category or type your own custom service</p>
          </div>

          <!-- Category Grid -->
          <div class="fgroup">
            <label>Select Category *</label>
            <div class="cat-grid" id="catGrid">
              <div class="cat-opt" onclick="selectCat('Home Repairs','&#128295;')">
                <div class="co-icon">&#128295;</div>
                <div class="co-label">Home Repairs</div>
              </div>
              <div class="cat-opt" onclick="selectCat('Cleaning','&#129529;')">
                <div class="co-icon">&#129529;</div>
                <div class="co-label">Cleaning</div>
              </div>
              <div class="cat-opt" onclick="selectCat('Auto Services','&#128663;')">
                <div class="co-icon">&#128663;</div>
                <div class="co-label">Auto Services</div>
              </div>
              <div class="cat-opt" onclick="selectCat('Beauty','&#128132;')">
                <div class="co-icon">&#128132;</div>
                <div class="co-label">Beauty</div>
              </div>
              <div class="cat-opt" onclick="selectCat('Logistics & Helpers','&#128666;')">
                <div class="co-icon">&#128666;</div>
                <div class="co-label">Logistics</div>
              </div>
              <div class="cat-opt" onclick="selectCat('Other Local Services','&#10024;')">
                <div class="co-icon">&#10024;</div>
                <div class="co-label">Other</div>
              </div>
            </div>

            <!-- Custom category -->
            <div class="cat-custom" style="margin-top:12px;">
              <input type="text" id="customCat"
                     placeholder="Or type your own: e.g. Pest Control, Gardening..."
                     oninput="customCatInput(this)"/>
            </div>
            <div class="hint" style="margin-top:6px;">
              💡 Focus on physical local services and skilled trades
            </div>
          </div>

          <!-- Selected Display -->
          <div id="catSelectedInfo"
               style="display:none;padding:10px 14px;
                      background:var(--green-lt);border-radius:10px;
                      font-size:13px;color:#065F46;font-weight:600;
                      margin-bottom:4px;">
            ✅ Selected: <span id="catSelectedText">—</span>
          </div>

          <div class="err-box" id="err1">
            <span>⚠️</span><span id="err1msg"></span>
          </div>

          <div class="btn-row">
            <button class="btn-next" onclick="v1()">`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacement);
  console.log("Successfully restored Step 1 layout structure!");
} else {
  console.error("Target pattern not found!");
}

// 2. Rebrand skill needed placeholder
const skillPlaceholderTarget = 'placeholder="e.g. Plumber, Math Teacher, Web Developer..."';
const skillPlaceholderReplacement = 'placeholder="e.g. Plumber, Electrician, Cleaner, Mechanic..."';
if (content.includes(skillPlaceholderTarget)) {
  content = content.replace(skillPlaceholderTarget, skillPlaceholderReplacement);
  console.log("Successfully rebranded skill needed placeholder!");
} else {
  console.log("Skill needed placeholder not found (might be already modified).");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("File written successfully!");
