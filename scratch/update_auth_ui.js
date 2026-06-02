const fs = require('fs');
const path = require('path');

// 1. UPDATE LOGIN PAGE (auth/login.html)
const loginPath = path.join(__dirname, '../auth/login.html');
let loginContent = fs.readFileSync(loginPath, 'utf8');

// Normalize line endings
loginContent = loginContent.replace(/\r?\n/g, '\n');

// Styles upgrade for split screen and Google button
const loginStylesTarget = `/* ── PAGE WRAP ── */
.page-wrap{
  flex:1;display:flex;
  align-items:center;justify-content:center;
  padding:40px 16px 60px;
  position:relative;z-index:1;
}`;

const loginStylesReplacement = `
/* Split-screen container styles */
.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 68px);
  flex: 1;
}
.split-left {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #fff;
}
.split-right {
  position: relative;
  background: linear-gradient(135deg, var(--dark) 0%, #2d0a1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px;
}
.split-right::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(244,63,94,.12) 1px, transparent 1px);
  background-size: 24px 24px;
}
.visual-wrap {
  position: relative;
  z-index: 2;
  max-width: 440px;
  color: #white;
}

/* Page Transition animation */
@keyframes fadeInPage {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
body {
  animation: fadeInPage 0.4s ease-out both;
}

/* Google Sign-in Button styling */
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: #fff;
  color: var(--dark);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  margin-top: 14px;
}
.google-btn:hover {
  background: var(--pink-bg);
  border-color: var(--rose-md);
  transform: translateY(-1px);
}

/* ── PAGE WRAP ── */
.page-wrap{
  flex:1;display:flex;
  align-items:center;justify-content:center;
  padding:40px 16px 60px;
  position:relative;z-index:1;
  display: none !important; /* Hide old centered wrapper */
}`;

if (loginContent.includes(loginStylesTarget)) {
  loginContent = loginContent.replace(loginStylesTarget, loginStylesReplacement);
  console.log("Updated login styles with split-screen rules and Google button.");
} else {
  console.error("Could not find style target in login.html!");
}

// Update login markup with Split Screen layout & Google buttons
const loginMarkupTarget = `<div class="page-wrap">
<div class="card">
  <div class="card-top">
    <a href="../index.html" class="logo" style="display:flex; align-items:center;"><img src="../assets/logo.png" alt="DoorSkill Logo" width="42" height="42" style="height:42px;">
<span style="font-size:26px; font-weight:900; color:var(--rose); margin-left:8px; font-family:'Playfair Display', serif; letter-spacing:-0.02em; display:inline-block; vertical-align:middle;">DoorSkill</span></a>
    <h2>Welcome Back! 👋</h2>
    <p>Login to your DoorSkill account<br/>
       and continue where you left off.</p>
  </div>

  <div class="role-tabs">
    <div class="role-tab active" id="tab-client" onclick="selectRole('client')">
      <span class="rt-icon">👤</span>
      <div class="rt-title">Client</div>
      <div class="rt-sub">I need services</div>
    </div>
    <div class="role-tab" id="tab-worker" onclick="selectRole('worker')">
      <span class="rt-icon">👷</span>
      <div class="rt-title">Worker</div>
      <div class="rt-sub">I provide services</div>
    </div>
  </div>

  <div class="msg-box" id="mainMsg">
    <span>⚠️</span>
    <span id="mainMsgText"></span>
  </div>

  <div class="divider"><span>login with phone</span></div>

  <div class="fgroup" id="phoneGroup">
    <label>Mobile Number (with country code)</label>
    <div class="input-wrap">
      <input type="tel" id="loginPhone" placeholder="+923001234567" onkeydown="enterKey(event)"/>
      <span class="input-icon">📱</span>
    </div>
  </div>

  <div id="recaptcha-container" style="margin-bottom: 16px;"></div>

  <div class="fgroup" id="otpGroup" style="display:none;">
    <label>Enter 6-Digit OTP</label>
    <div class="input-wrap">
      <input type="text" id="loginOtp" placeholder="123456" maxlength="6" onkeydown="enterKey(event)"/>
      <span class="input-icon">🔑</span>
    </div>
  </div>

  <button class="submit-btn" id="loginBtn" onclick="doLogin()">
    Send OTP →
  </button>

  <div class="bottom-links">
    <p>Don't have an account?</p>
    <p style="margin-top:8px;">
      <a href="client-signup.html">Sign Up as Client</a>
      &nbsp;|&nbsp;
      <a href="worker-signup.html">Join as Worker</a>
    </p>
  </div>
</div>
</div>`;

const loginMarkupReplacement = `<!-- Split screen container -->
<div class="split-container">
  <!-- Left Column: Form -->
  <div class="split-left">
    <div class="form-container">
      <div class="card" style="box-shadow:none; border:none; padding: 0;">
        <div class="card-top" style="text-align:left; margin-bottom: 24px;">
          <a href="../index.html" class="logo" style="display:flex; align-items:center; margin-bottom:12px;"><img src="../assets/logo.png" alt="DoorSkill Logo" width="36" height="36" style="height:36px;">
      <span style="font-size:24px; font-weight:900; color:var(--rose); margin-left:8px; font-family:'Playfair Display', serif; letter-spacing:-0.02em; display:inline-block; vertical-align:middle;">DoorSkill</span></a>
          <h2 style="font-size:26px;">Welcome Back! 👋</h2>
          <p>Login to your DoorSkill account and continue.</p>
        </div>

        <!-- Google button at the top -->
        <button class="google-btn" onclick="continueWithGoogle()" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0;">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 0 1 8.35 13a5.626 5.626 0 0 1 5.64-5.6c1.472 0 2.8.54 3.82 1.428l3.1-3.1A10.02 10.02 0 0 0 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.316 0 9.71-3.847 9.99-9.143H12.24Z"/>
          </svg>
          Continue with Google
        </button>

        <div class="divider"><span>or login with phone</span></div>

        <div class="role-tabs" style="margin-bottom:18px;">
          <div class="role-tab active" id="tab-client" onclick="selectRole('client')">
            <span class="rt-icon">👤</span>
            <div class="rt-title">Client</div>
          </div>
          <div class="role-tab" id="tab-worker" onclick="selectRole('worker')">
            <span class="rt-icon">👷</span>
            <div class="rt-title">Worker</div>
          </div>
        </div>

        <div class="msg-box" id="mainMsg">
          <span>⚠️</span>
          <span id="mainMsgText"></span>
        </div>

        <div class="fgroup" id="phoneGroup">
          <label>Mobile Number (with country code)</label>
          <div class="input-wrap">
            <input type="tel" id="loginPhone" placeholder="+923001234567" onkeydown="enterKey(event)"/>
            <span class="input-icon">📱</span>
          </div>
        </div>

        <div id="recaptcha-container" style="margin-bottom: 16px;"></div>

        <div class="fgroup" id="otpGroup" style="display:none;">
          <label>Enter 6-Digit OTP</label>
          <div class="input-wrap">
            <input type="text" id="loginOtp" placeholder="123456" maxlength="6" onkeydown="enterKey(event)"/>
            <span class="input-icon">🔑</span>
          </div>
        </div>

        <button class="submit-btn" id="loginBtn" onclick="doLogin()">
          Send OTP →
        </button>

        <div class="bottom-links" style="text-align:left; border-top:1px solid var(--border); padding-top:20px;">
          <p>Don't have an account?</p>
          <p style="margin-top:8px;">
            <a href="client-signup.html">Sign Up as Client</a>
            &nbsp;|&nbsp;
            <a href="worker-signup.html">Join as Worker</a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column: Visual Panel -->
  <div class="split-right">
    <div class="visual-wrap">
      <h2 style="font-family:'Playfair Display',serif; font-size:36px; font-weight:900; margin-bottom:20px; color:#fff;">Join Pakistan's Top Trade Network</h2>
      <p style="font-size:16px; line-height:1.7; opacity:0.9; margin-bottom:40px; color:rgba(255,255,255,0.85);">Get tasks completed instantly by verified local specialists. Secure payment escrow and premium in-app chat protect every single job.</p>
      
      <!-- Quick stats -->
      <div style="display:flex; gap:40px; margin-bottom:40px;">
        <div>
          <div style="font-size:32px; font-weight:800; color:var(--rose-md);">12,000+</div>
          <div style="font-size:12px; opacity:0.7; color:rgba(255,255,255,0.7);">Verified Workers</div>
        </div>
        <div>
          <div style="font-size:32px; font-weight:800; color:var(--rose-md);">45,000+</div>
          <div style="font-size:12px; opacity:0.7; color:rgba(255,255,255,0.7);">Completed Jobs</div>
        </div>
      </div>
      
      <!-- Testimonial citation -->
      <div style="background:rgba(255,255,255,0.06); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px);">
        <p style="font-style:italic; font-size:14px; line-height:1.6; margin-bottom:10px; color:rgba(255,255,255,0.9);">"The payment escrow gave me total security. The plumber did a fantastic job, and I only released the payment when I was fully satisfied."</p>
        <div style="font-weight:700; font-size:13px; color:#fff;">— Ahmed Raza, Lahore</div>
      </div>
    </div>
  </div>
</div>

<script>
function continueWithGoogle() {
  alert('Google authentication will require client configuration on live deployment.');
}
</script>`;

if (loginContent.includes(loginMarkupTarget)) {
  loginContent = loginContent.replace(loginMarkupTarget, loginMarkupReplacement);
  console.log("Updated login.html layout with split screen markup.");
} else {
  // Try with normalized whitespace if failed
  console.error("Could not find login markup target in login.html!");
}

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log("LOGIN PAGE UPGRADES COMPLETED!");


// 2. UPDATE WORKER SIGNUP PAGE (auth/worker-signup.html)
const signupPath = path.join(__dirname, '../auth/worker-signup.html');
let signupContent = fs.readFileSync(signupPath, 'utf8');

// Normalize line endings
signupContent = signupContent.replace(/\r?\n/g, '\n');

// Styles upgrade for split screen, password strength, Google button, horizontal progress bar
const signupStylesTarget = `/* ── WRAPPER ── */
.page-wrap{
  flex:1;display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:40px 16px 60px;
}`;

const signupStylesReplacement = `
/* Split-screen container styles */
.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 68px);
  flex: 1;
}
.split-left {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 24px;
  background: #fff;
}
.split-right {
  position: relative;
  background: linear-gradient(135deg, var(--dark) 0%, #2d0a1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px;
}
.split-right::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(244,63,94,.12) 1px, transparent 1px);
  background-size: 24px 24px;
}
.visual-wrap {
  position: relative;
  z-index: 2;
  max-width: 440px;
  color: #fff;
}

/* Page Transition animation */
@keyframes fadeInPage {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
body {
  animation: fadeInPage 0.4s ease-out both;
}

/* Google Registration Button */
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: #fff;
  color: var(--dark);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  margin-top: 14px;
}
.google-btn:hover {
  background: var(--pink-bg);
  border-color: var(--rose-md);
  transform: translateY(-1px);
}

/* Password Strength Indicator */
.strength-meter {
  height: 4px;
  background: var(--border);
  margin-top: 6px;
  border-radius: 2px;
  overflow: hidden;
}
.strength-bar {
  height: 100%;
  width: 0%;
  transition: width 0.3s, background-color 0.3s;
}
.strength-text {
  font-size: 11px;
  font-weight: 700;
  margin-top: 4px;
  display: block;
}

/* Hide old centering wrapper */
.page-wrap{
  flex:1;display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:40px 16px 60px;
  display: none !important;
}`;

if (signupContent.includes(signupStylesTarget)) {
  signupContent = signupContent.replace(signupStylesTarget, signupStylesReplacement);
  console.log("Updated worker-signup styles with split-screen, password gauge, and Google button.");
} else {
  console.error("Could not find style target in worker-signup.html!");
}

// Replace the old progress dot HTML block with a modern progress bar
const signupProgressTarget = `  <div class="progress-wrap" id="progressWrap">
    <div class="steps-row">
      <div class="sdot active" id="dot-1">1</div>
      <div class="sline" id="line-1"></div>
      <div class="sdot" id="dot-2">2</div>
      <div class="sline" id="line-2"></div>
      <div class="sdot" id="dot-3">3</div>
      <div class="sline" id="line-3"></div>
      <div class="sdot" id="dot-4">4</div>
    </div>
    <div class="step-labels">
      <span class="active" style="margin-left:-6px;">Contact</span>
      <span>Basic</span>
      <span>Skills</span>
      <span style="margin-right:-10px;">Docs</span>
    </div>
  </div>`;

const signupProgressReplacement = `  <div class="progress-wrap" id="progressWrap" style="margin-bottom: 24px;">
    <div style="background: var(--border); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px; position:relative;">
      <div id="signupProgressBar" style="background: linear-gradient(90deg, var(--rose), var(--rose-md)); width: 25%; height: 100%; transition: width 0.4s ease;"></div>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--muted);">
      <span id="stepLbl-1" style="color:var(--rose);">Step 1: Contact</span>
      <span id="stepLbl-2">Step 2: Basic</span>
      <span id="stepLbl-3">Step 3: Skills</span>
      <span id="stepLbl-4">Step 4: Docs</span>
    </div>
  </div>`;

if (signupContent.includes(signupProgressTarget)) {
  signupContent = signupContent.replace(signupProgressTarget, signupProgressReplacement);
  console.log("Replaced step dots with modern progress bar.");
} else {
  console.error("Could not find progress-wrap target in worker-signup.html!");
}

// Inject Password Strength meter HTML below password field
const passwordFieldTarget = `    <div class="fgroup">
      <label>Password * <span style="font-size:10px;color:var(--muted);text-transform:none;letter-spacing:0;">(Min 6 characters)</span></label>
      <input type="password" id="password" placeholder="Min 6 characters" />
    </div>`;

const passwordFieldReplacement = `    <div class="fgroup">
      <label>Password * <span style="font-size:10px;color:var(--muted);text-transform:none;letter-spacing:0;">(Min 6 characters)</span></label>
      <input type="password" id="password" placeholder="Min 6 characters" oninput="checkPasswordStrength(this.value)" />
      <!-- Password Strength Meter -->
      <div class="strength-meter">
        <div id="strengthBar" class="strength-bar"></div>
      </div>
      <span id="strengthText" class="strength-text" style="color: var(--muted);">Password Complexity</span>
    </div>`;

if (signupContent.includes(passwordFieldTarget)) {
  signupContent = signupContent.replace(passwordFieldTarget, passwordFieldReplacement);
  console.log("Injected password strength gauge elements.");
} else {
  console.error("Could not find password field in worker-signup.html!");
}

// Restructure worker-signup page into split-screen container & insert Google button
const signupWrapperOpenTarget = `<div class="page-wrap">
<div class="card">
  <div class="card-header">
    <a href="../index.html" class="logo" style="display:flex; align-items:center;"><img src="../assets/logo.png" alt="DoorSkill Logo" width="42" height="42" style="height:42px;">
<span style="font-size:26px; font-weight:900; color:var(--rose); margin-left:8px; font-family:'Playfair Display', serif; letter-spacing:-0.02em; display:inline-block; vertical-align:middle;">DoorSkill</span></a>
    <h2>Become a Verified Professional</h2>
    <p>Sign up in minutes, verify your skills,<br/>
       and start receiving jobs in your area.</p>
  </div>`;

const signupWrapperOpenReplacement = `<div class="split-container">
  <!-- Left side: Form -->
  <div class="split-left">
    <div class="form-container" style="width: 100%; max-width: 500px;">
      <div class="card" style="box-shadow:none; border:none; padding: 0;">
        <div class="card-header" style="text-align:left; margin-bottom: 24px;">
          <a href="../index.html" class="logo" style="display:flex; align-items:center; margin-bottom:12px;"><img src="../assets/logo.png" alt="DoorSkill Logo" width="36" height="36" style="height:36px;">
      <span style="font-size:24px; font-weight:900; color:var(--rose); margin-left:8px; font-family:'Playfair Display', serif; letter-spacing:-0.02em; display:inline-block; vertical-align:middle;">DoorSkill</span></a>
          <h2 style="font-size:24px;">Become a Verified Professional</h2>
          <p>Sign up in minutes, verify your identity, and get local job alerts.</p>
        </div>

        <button class="google-btn" onclick="continueWithGoogle()" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0;">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 0 1 8.35 13a5.626 5.626 0 0 1 5.64-5.6c1.472 0 2.8.54 3.82 1.428l3.1-3.1A10.02 10.02 0 0 0 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.316 0 9.71-3.847 9.99-9.143H12.24Z"/>
          </svg>
          Register with Google
        </button>

        <div class="divider" style="display:flex; align-items:center; gap:12px; margin:20px 0;"><span style="font-size:12px; color:var(--muted); font-weight:500;">or register with phone</span></div>`;

if (signupContent.includes(signupWrapperOpenTarget)) {
  signupContent = signupContent.replace(signupWrapperOpenTarget, signupWrapperOpenReplacement);
  console.log("Injected split screen wrapper and Google button on signup.");
} else {
  console.error("Could not find signup wrapper start in worker-signup.html!");
}

// Close split-container structure at the end of the markup
const signupWrapperCloseTarget = `</div><!-- end .card -->
</div><!-- end .page-wrap -->`;

const signupWrapperCloseReplacement = `      </div><!-- end .card -->
    </div><!-- end .form-container -->
  </div><!-- end .split-left -->
  
  <!-- Right side: Visual and Benefits Panel -->
  <div class="split-right">
    <div class="visual-wrap">
      <h2 style="font-family:'Playfair Display',serif; font-size:36px; font-weight:900; margin-bottom:20px; color:#fff;">Maximize Your Earnings Today</h2>
      <p style="font-size:16px; line-height:1.7; opacity:0.9; margin-bottom:40px; color:rgba(255,255,255,0.85);">Become a DoorSkill worker and enjoy these exclusive benefits designed to help you grow your local business:</p>
      
      <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:40px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">💰</span>
          <div>
            <div style="font-weight:700; font-size:15px; color:#fff;">0% Commission Launch Offer</div>
            <div style="font-size:12px; opacity:0.7; color:rgba(255,255,255,0.7);">Keep 100% of your earnings for the first 3 months.</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">🚨</span>
          <div>
            <div style="font-weight:700; font-size:15px; color:#fff;">Instant Local Job Alerts</div>
            <div style="font-size:12px; opacity:0.7; color:rgba(255,255,255,0.7);">Get notifications about job requests near your address instantly.</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">🔒</span>
          <div>
            <div style="font-weight:700; font-size:15px; color:#fff;">Secure Escrow Protection</div>
            <div style="font-size:12px; opacity:0.7; color:rgba(255,255,255,0.7);">Never worry about non-payments. Payments are secured in escrow first.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

if (signupContent.includes(signupWrapperCloseTarget)) {
  signupContent = signupContent.replace(signupWrapperCloseTarget, signupWrapperCloseReplacement);
  console.log("Closed split-screen container structure in worker-signup.html.");
} else {
  console.error("Could not find signup wrapper end in worker-signup.html!");
}

// Modify step transition function goStep() to animate horizontal progress bar
const goStepTarget = `window.goStep = function(n){
  document.querySelectorAll('.fstep').forEach(s=>s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');

  // dots
  for(let i=1; i<=4; i++){
    const dot = document.getElementById('dot-'+i);
    if(!dot) continue;
    dot.className = 'sdot';
    if(i === n) dot.className = 'sdot active';
    if(i < n)  dot.className = 'sdot done';

    const line = document.getElementById('line-'+i);
    if(line) {
      line.className = 'sline';
      if(i < n) line.className = 'sline done';
    }
  }
  // scroll top
  window.scrollTo({top:0,behavior:'smooth'});
};`;

const goStepReplacement = `window.goStep = function(n){
  document.querySelectorAll('.fstep').forEach(s=>s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');

  // Update progress bar width
  const pct = n === 1 ? 25 : (n === 2 ? 50 : (n === 3 ? 75 : 100));
  const pBar = document.getElementById('signupProgressBar');
  if (pBar) pBar.style.width = pct + '%';

  // Update step label colors
  for(let i=1; i<=4; i++){
    const lbl = document.getElementById('stepLbl-' + i);
    if (lbl) {
      lbl.style.color = (i === n) ? 'var(--rose)' : 'var(--muted)';
    }
  }

  // scroll top
  window.scrollTo({top:0,behavior:'smooth'});
};`;

if (signupContent.includes(goStepTarget)) {
  signupContent = signupContent.replace(goStepTarget, goStepReplacement);
  console.log("Updated step transition script to animate progress bar width.");
} else {
  console.error("Could not find goStep script in worker-signup.html!");
}

// Inject password strength logic script and Google alert
const signupScriptEndTarget = `// Expose resend via button
window.sendOTP = window.sendOTP;`;

const signupScriptEndReplacement = `// Expose resend via button
window.sendOTP = window.sendOTP;

/* ── Password Strength Gauge Logic ── */
window.checkPasswordStrength = function(pass) {
  const bar = document.getElementById('strengthBar');
  const txt = document.getElementById('strengthText');
  if (!bar || !txt) return;

  if (!pass) {
    bar.style.width = '0%';
    bar.style.backgroundColor = 'var(--border)';
    txt.textContent = 'Password Complexity';
    txt.style.color = 'var(--muted)';
    return;
  }

  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  let pct = '0%';
  let color = 'var(--red)';
  let label = 'Weak ❌';

  if (score <= 2) {
    pct = '33%';
    color = 'var(--red)';
    label = 'Weak ❌';
  } else if (score <= 4) {
    pct = '66%';
    color = 'orange';
    label = 'Medium ⚡';
  } else {
    pct = '100%';
    color = 'var(--green)';
    label = 'Strong 💪';
  }

  bar.style.width = pct;
  bar.style.backgroundColor = color;
  txt.textContent = 'Strength: ' + label;
  txt.style.color = color;
};

window.continueWithGoogle = function() {
  alert('Google authentication registration will require client configuration on live deployment.');
};`;

if (signupContent.includes(signupScriptEndTarget)) {
  signupContent = signupContent.replace(signupScriptEndTarget, signupScriptEndReplacement);
  console.log("Injected Password strength gauge JS script.");
} else {
  console.error("Could not find script injection target in worker-signup.html!");
}

fs.writeFileSync(signupPath, signupContent, 'utf8');
console.log("WORKER-SIGNUP UPGRADES COMPLETED!");
