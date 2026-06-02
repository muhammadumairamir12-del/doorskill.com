const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Helper to normalize line endings to LF
const normalize = (str) => str.replace(/\r?\n/g, '\n');

// Common Pakistan Phone Formatting Function
const phoneFormatterJS = `function formatPakistanPhone(phone) {
  // Strip all spaces, dashes, parentheses from phone input
  let cleaned = phone.replace(/[\\s\\-()]/g, '');
  if (cleaned.startsWith('0')) {
    // If number starts with "0", replace with "+92"
    return '+92' + cleaned.substring(1);
  } else if (cleaned.startsWith('92')) {
    // If number starts with "92" (no plus), add "+" prefix
    return '+' + cleaned;
  } else if (cleaned.startsWith('+92')) {
    // If number starts with "+92", keep as is
    return cleaned;
  } else {
    if (cleaned.length === 10) {
      return '+92' + cleaned;
    }
    if (!cleaned.startsWith('+')) {
      return '+92' + cleaned;
    }
    return cleaned;
  }
}`;


// ==========================================
// 1. MODIFY auth/client-signup.html
// ==========================================
function fixClientSignup() {
  const file = path.join(projectRoot, 'auth/client-signup.html');
  if (!fs.existsSync(file)) return console.error("client-signup.html not found!");
  let content = normalize(fs.readFileSync(file, 'utf8'));

  // A. Replace recaptcha container ID
  content = content.replace(
    `<div id="client-recaptcha-container" style="margin-bottom:4px;"></div>`,
    `<div id="recaptcha-container" style="margin-bottom:4px;"></div>`
  );

  // B. Update Recaptcha ID in Send OTP js call
  content = content.replace(
    `window.clientRecaptcha = new RecaptchaVerifier(auth, 'client-recaptcha-container', {`,
    `window.clientRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {`
  );

  // C. Update clientSendOTP function to format phone, instantiate correctly and save to window.confirmationResult
  const otpSendTarget = `window.clientSendOTP = async function() {
  const phone = document.getElementById('phone').value.trim();
  if(!phone) return showMsg('error','Please enter your phone number first.');
  
  // Validate phone format (basic check)
  if(phone.length < 10) return showMsg('error','Please enter a valid phone number with country code (e.g. +923001234567)');
  
  const btn = document.getElementById('clientSendOtpBtn');
  btn.disabled = true;
  btn.textContent = '📱 Sending OTP...';

  try {
    // Clear old recaptcha
    if(window.clientRecaptcha) {
      try { window.clientRecaptcha.clear(); } catch(e) {}
    }
    window.clientRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible'
    });

    const result = await signInWithPhoneNumber(auth, phone, window.clientRecaptcha);
    clientConfirmation = result;`;

  const otpSendReplacement = `${phoneFormatterJS}

window.clientSendOTP = async function() {
  const rawPhone = document.getElementById('phone').value.trim();
  if(!rawPhone) return showMsg('error','Please enter your phone number first.');
  
  const phone = formatPakistanPhone(rawPhone);
  
  const btn = document.getElementById('clientSendOtpBtn');
  btn.disabled = true;
  btn.textContent = '📱 Sending OTP...';

  try {
    // Clear old recaptcha
    if(window.clientRecaptcha) {
      try { window.clientRecaptcha.clear(); } catch(e) {}
    }
    window.clientRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible'
    });

    const result = await signInWithPhoneNumber(auth, phone, window.clientRecaptcha);
    window.confirmationResult = result;`;

  if (content.includes(otpSendTarget)) {
    content = content.replace(otpSendTarget, otpSendReplacement);
    console.log("Replaced clientSendOTP start in client-signup!");
  } else {
    console.error("clientSendOTP target not found in client-signup!");
  }

  // D. Update error block in clientSendOTP
  content = content.replace(
    `showMsg('error', msg);`,
    `showMsg('error', msg);\n    if(window.clientRecaptcha) {\n      try { window.clientRecaptcha.clear(); } catch(e) {}\n    }`
  );

  // E. Update clientVerifyOTP to use window.confirmationResult
  content = content.replace(
    `const result = await clientConfirmation.confirm(code);`,
    `const result = await window.confirmationResult.confirm(code);`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log("Successfully updated client-signup.html!");
}


// ==========================================
// 2. MODIFY auth/login.html
// ==========================================
function fixLogin() {
  const file = path.join(projectRoot, 'auth/login.html');
  if (!fs.existsSync(file)) return console.error("login.html not found!");
  let content = normalize(fs.readFileSync(file, 'utf8'));

  const loginSendTarget = `window.doLogin = async function(){
  const role = window._selectedRole || 'client';

  if(!confirmationResult) {
    const phone = document.getElementById('loginPhone').value.trim();
    if(!phone) return showMsg('error','Please enter your phone number with country code.');
    
    showLoad('Sending OTP...','Please wait');
    setBtnLoad(true);

    try {
      if(!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      }
      confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);`;

  const loginSendReplacement = `${phoneFormatterJS}

window.doLogin = async function(){
  const role = window._selectedRole || 'client';

  if(!window.confirmationResult) {
    const rawPhone = document.getElementById('loginPhone').value.trim();
    if(!rawPhone) return showMsg('error','Please enter your phone number with country code.');
    
    const phone = formatPakistanPhone(rawPhone);
    
    showLoad('Sending OTP...','Please wait');
    setBtnLoad(true);

    try {
      if(window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e) {}
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = result;`;

  if (content.includes(loginSendTarget)) {
    content = content.replace(loginSendTarget, loginSendReplacement);
    console.log("Replaced doLogin send part in login.html!");
  } else {
    console.error("doLogin send part target not found in login.html!");
  }

  // Handle verify confirmationResult confirm
  content = content.replace(
    `const cred = await confirmationResult.confirm(otp);`,
    `const cred = await window.confirmationResult.confirm(otp);`
  );
  
  content = content.replace(
    `if(window.recaptchaVerifier) window.recaptchaVerifier.clear();`,
    `if(window.recaptchaVerifier) { try { window.recaptchaVerifier.clear(); } catch(e) {} }`
  );
  
  content = content.replace(
    `if(!confirmationResult) {`,
    `if(!window.confirmationResult) {`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log("Successfully updated login.html!");
}


// ==========================================
// 3. MODIFY auth/worker-signup.html
// ==========================================
function fixWorkerSignup() {
  const file = path.join(projectRoot, 'auth/worker-signup.html');
  if (!fs.existsSync(file)) return console.error("worker-signup.html not found!");
  let content = normalize(fs.readFileSync(file, 'utf8'));

  // A. Add Recaptcha container
  const btnTarget = `<button class="gps-btn" id="sendOtpBtn" onclick="sendOTP()" style="margin-bottom:16px;">`;
  const btnReplacement = `<div id="recaptcha-container" style="margin-bottom: 4px;"></div>\n    <button class="gps-btn" id="sendOtpBtn" onclick="sendOTP()" style="margin-bottom:16px;">`;
  if (content.includes(btnTarget)) {
    content = content.replace(btnTarget, btnReplacement);
    console.log("Added recaptcha-container above Send OTP button in worker-signup!");
  } else {
    console.error("Send OTP button target not found in worker-signup!");
  }

  // B. Import RecaptchaVerifier and signInWithPhoneNumber
  content = content.replace(
    `import { getAuth, createUserWithEmailAndPassword, updateProfile }`,
    `import { getAuth, createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier, signInWithPhoneNumber }`
  );

  // C. Replace Simulated OTP block
  const simOtpStart = `// ── OTP System (Simulated — works without SMS plan) ──`;
  const simOtpEnd = `// ── MAIN SUBMIT ──`;
  
  const startIndex = content.indexOf(simOtpStart);
  const endIndex = content.indexOf(simOtpEnd);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const originalOtpBlock = content.substring(startIndex, endIndex);
    
    const realOtpBlock = `// ── OTP System (Real Firebase Auth) ──
${phoneFormatterJS}

let otpCountdownInterval = null;
let otpExpireTime = null;

window.sendOTP = async function() {
  const code = document.getElementById('mobileCode').value.trim();
  let ph     = document.getElementById('phone').value.trim();
  if(!code || !ph) return showErr('err1', 'پہلے اپنا موبائل نمبر لکھیں۔ (Please enter your mobile number.)');
  
  // Strip leading "0" from mobile input before concatenating
  if (ph.startsWith('0')) {
    ph = ph.substring(1);
  }
  const rawPhone = code + ph;
  const phone = formatPakistanPhone(rawPhone);
  
  const btn = document.getElementById('sendOtpBtn');
  btn.disabled = true;
  btn.textContent = '📱 Sending OTP...';

  try {
    if(window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch(e) {}
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });

    const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    window.confirmationResult = result;

    // Show OTP group
    const grp = document.getElementById('otpGroup');
    grp.style.display = 'block';
    document.getElementById('otpInput').value = '';
    document.getElementById('otpInput').disabled = false;
    document.getElementById('verifyOtpBtn').disabled = false;
    document.getElementById('verifyOtpBtn').textContent = '✔ Verify';
    document.getElementById('otpResendBtn').style.display = 'none';
    document.getElementById('otpVerifiedBadge').style.display = 'none';

    // Disable phone editing
    document.getElementById('phone').disabled = true;
    document.getElementById('mobileCode').disabled = true;
    btn.textContent = '✅ OTP Sent!';

    // Start 5-minute countdown
    startOtpTimer(300);
    
    // Scroll OTP into view
    grp.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Show a success message in OTP Hint Box
    document.getElementById('otpHintBox').style.display = 'block';
    document.getElementById('otpDebugHint').textContent = 'SMS sent to: ' + phone;

  } catch(err) {
    console.error('Worker OTP Error:', err);
    btn.disabled = false;
    btn.textContent = '📱 Send OTP to Verify Phone';
    document.getElementById('phone').disabled = false;
    document.getElementById('mobileCode').disabled = false;

    let msg = 'Failed to send OTP: ' + err.message;
    if(err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait a few minutes.';
    if(err.code === 'auth/invalid-phone-number') msg = 'Invalid phone number format.';
    showErr('err1', msg);
    if(window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch(e) {}
    }
  }
};

function startOtpTimer(seconds) {
  otpExpireTime = Date.now() + (seconds * 1000);
  clearInterval(otpCountdownInterval);
  const timerWrap = document.getElementById('otpTimerWrap');
  const badge = document.getElementById('otpTimerBadge');
  timerWrap.style.display = 'flex';

  otpCountdownInterval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((otpExpireTime - Date.now()) / 1000));
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    badge.textContent = min.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0');
    if(remaining <= 60 && remaining > 0) {
      badge.className = 'timer-badge warning';
    } else if(remaining > 60) {
      badge.className = 'timer-badge';
    }
    if(remaining <= 0) {
      clearInterval(otpCountdownInterval);
      badge.textContent = 'EXPIRED';
      badge.className = 'timer-badge expired';
      document.getElementById('otpResendBtn').style.display = 'inline-block';
      document.getElementById('sendOtpBtn').disabled = false;
      document.getElementById('sendOtpBtn').textContent = '📱 Send OTP to Verify Phone';
      document.getElementById('phone').disabled = false;
      document.getElementById('mobileCode').disabled = false;
      showErr('err1', 'OTP expire ہو گیا۔ دوبارہ بھیجیں۔');
    }
  }, 1000);
}

window.verifyOTP = async function() {
  const entered = document.getElementById('otpInput').value.trim();
  if(!entered || entered.length !== 6) return showErr('err1', '6 ہندسوں کا OTP لکھیں۔');
  if(otpExpireTime && Date.now() > otpExpireTime) {
    showErr('err1', 'OTP expire ہو گیا۔ دوبارہ بھیجیں۔');
    document.getElementById('otpResendBtn').style.display = 'inline-block';
    return;
  }
  
  const btn = document.getElementById('verifyOtpBtn');
  btn.disabled = true;
  btn.textContent = 'Verifying...';

  try {
    const result = await window.confirmationResult.confirm(entered);
    window.isPhoneVerified = true;
    clearInterval(otpCountdownInterval);
    document.getElementById('otpInput').disabled = true;
    document.getElementById('otpTimerWrap').style.display = 'none';
    document.getElementById('otpResendBtn').style.display = 'none';
    document.getElementById('otpHintBox').style.display = 'none';
    document.getElementById('otpVerifiedBadge').style.display = 'flex';
    btn.style.display = 'none';
    document.getElementById('phone').readOnly = true;
    document.getElementById('phone').disabled = true;
    document.getElementById('mobileCode').disabled = true;
    document.getElementById('sendOtpBtn').style.display = 'none';
  } catch(err) {
    console.error('Worker Verify Error:', err);
    btn.disabled = false;
    btn.textContent = '✔ Verify';
    showErr('err1', 'غلط OTP کوڈ ہے۔ دوبارہ چیک کریں۔ (Invalid OTP, please try again)');
    document.getElementById('otpInput').style.borderColor = 'var(--red)';
    setTimeout(() => document.getElementById('otpInput').style.borderColor = '', 2000);
  }
};

// Expose resend via button
window.sendOTP = window.sendOTP;

`;
    content = content.replace(originalOtpBlock, realOtpBlock);
    console.log("Successfully replaced simulated OTP with real phone auth block in worker-signup!");
  } else {
    console.error("Simulated OTP delimiters not found in worker-signup!");
  }

  // D. Update main submit function phone concatenation formatting
  content = content.replace(
    `const phone      = document.getElementById('mobileCode').value + document.getElementById('phone').value.trim();`,
    `let phRaw = document.getElementById('phone').value.trim();\n    if (phRaw.startsWith('0')) phRaw = phRaw.substring(1);\n    const phone = formatPakistanPhone(document.getElementById('mobileCode').value + phRaw);`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log("Successfully updated worker-signup.html!");
}


fixClientSignup();
fixLogin();
fixWorkerSignup();
console.log("All Phone Auth flow fixes completed successfully!");
