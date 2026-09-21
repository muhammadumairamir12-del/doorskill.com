const fs = require('fs');

let content = fs.readFileSync('auth/worker-signup.html', 'utf8');

// 1. Country default
content = content.replace(
  '<option value="Pakistan" data-code="+92">🇵🇰 Pakistan</option>',
  '<option value="Pakistan" data-code="+92" selected>🇵🇰 Pakistan</option>'
);

// 2. City default
content = content.replace(
  '<input type="text" id="city" placeholder="e.g. Karachi, New York, etc." />',
  '<input type="text" id="city" value="Multan" placeholder="e.g. Karachi, New York, etc." />'
);

// 3. New Address fields
content = content.replace(
  `    <div class="fgroup">
      <label>Complete Address *</label>
      <input type="text" id="address" placeholder="House No / Flat / Street / Area" />
    </div>`,
  `    <div class="fgroup">
      <label>Complete Address *</label>
      <input type="text" id="address" placeholder="House No / Flat / Street / Area" />
    </div>

    <div class="frow">
      <div class="fgroup">
        <label>Town / Area *</label>
        <input type="text" id="town" placeholder="e.g. Gulgasht Colony" />
      </div>
      <div class="fgroup">
        <label>Street *</label>
        <input type="text" id="street" placeholder="e.g. Street 4" />
      </div>
    </div>
    
    <div class="fgroup">
      <label>Market / Landmark <span class="optional-badge">Optional</span></label>
      <input type="text" id="market" placeholder="e.g. Main Market" />
    </div>
    
    <div class="frow">
      <div class="fgroup">
        <label>Shop Name <span class="optional-badge">Optional</span></label>
        <input type="text" id="shopName" placeholder="e.g. Ali Plumbers" />
      </div>
      <div class="fgroup">
        <label>Shop Address <span class="optional-badge">Optional</span></label>
        <input type="text" id="shopAddress" placeholder="e.g. Shop # 12" />
      </div>
    </div>`
);

// 4. Live Camera & Diploma Upload
content = content.replace(
  `    <div class="frow">
      <div class="fgroup">
        <label>ID Photo (FRONT) *</label>
        <div class="upload-box" id="cnicFrontBox">
          <input type="file" id="cnicFrontFile" accept="image/*" onchange="fileChosen(this,'cnicFrontBox','cnicFrontName')"/>
          <div class="upload-box-icon">🪪</div>
          <div class="upload-box-text">Front Side</div>
        </div>
        <div class="file-chosen" id="cnicFrontChosen">
          <span>✅</span><span id="cnicFrontName">file.jpg</span>
          <button class="file-remove" onclick="removeFile('cnicFrontFile','cnicFrontBox','cnicFrontChosen')">×</button>
        </div>
      </div>
      <div class="fgroup">
        <label>ID Photo (BACK) *</label>
        <div class="upload-box" id="cnicBackBox">
          <input type="file" id="cnicBackFile" accept="image/*" onchange="fileChosen(this,'cnicBackBox','cnicBackName')"/>
          <div class="upload-box-icon">🪪</div>
          <div class="upload-box-text">Back Side</div>
        </div>
        <div class="file-chosen" id="cnicBackChosen">
          <span>✅</span><span id="cnicBackName">file.jpg</span>
          <button class="file-remove" onclick="removeFile('cnicBackFile','cnicBackBox','cnicBackChosen')">×</button>
        </div>
      </div>
    </div>`,
  `    <div class="frow" style="margin-bottom:10px;">
      <div class="fgroup">
        <label>ID Photo (FRONT) *</label>
        <div class="upload-box" id="cnicFrontBox" style="margin-bottom:8px;">
          <input type="file" id="cnicFrontFile" accept="image/*" onchange="fileChosen(this,'cnicFrontBox','cnicFrontName')"/>
          <div class="upload-box-icon">🪪</div>
          <div class="upload-box-text">Upload Front</div>
        </div>
        <button class="btn-back" style="width:100%;font-size:12px;padding:8px;" onclick="openCamera('cnicFrontFile', 'cnicFrontBox', 'cnicFrontName', 'cnicFrontChosen')">📷 Live Capture</button>
        <div class="file-chosen" id="cnicFrontChosen">
          <span>✅</span><span id="cnicFrontName" style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">file.jpg</span>
          <button class="file-remove" onclick="removeFile('cnicFrontFile','cnicFrontBox','cnicFrontChosen')">×</button>
        </div>
      </div>
      <div class="fgroup">
        <label>ID Photo (BACK) *</label>
        <div class="upload-box" id="cnicBackBox" style="margin-bottom:8px;">
          <input type="file" id="cnicBackFile" accept="image/*" onchange="fileChosen(this,'cnicBackBox','cnicBackName')"/>
          <div class="upload-box-icon">🪪</div>
          <div class="upload-box-text">Upload Back</div>
        </div>
        <button class="btn-back" style="width:100%;font-size:12px;padding:8px;" onclick="openCamera('cnicBackFile', 'cnicBackBox', 'cnicBackName', 'cnicBackChosen')">📷 Live Capture</button>
        <div class="file-chosen" id="cnicBackChosen">
          <span>✅</span><span id="cnicBackName" style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">file.jpg</span>
          <button class="file-remove" onclick="removeFile('cnicBackFile','cnicBackBox','cnicBackChosen')">×</button>
        </div>
      </div>
    </div>

    <!-- Live Camera Container -->
    <div id="cameraContainer" style="display:none;background:var(--rose-lt);padding:14px;border-radius:12px;margin-bottom:16px;text-align:center;">
      <video id="cameraVideo" autoplay playsinline style="width:100%;max-width:320px;border-radius:8px;background:#000;margin-bottom:10px;"></video>
      <canvas id="cameraCanvas" style="display:none;"></canvas>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button class="btn-back" style="flex:1;background:#fff;" onclick="closeCamera()">Cancel</button>
        <button class="btn-next" style="flex:1;padding:10px;" onclick="capturePhoto()">📸 Capture</button>
      </div>
    </div>

    <div class="fgroup" style="margin-top:16px;">
      <label>Diplomas / Certificates <span class="optional-badge">Optional</span></label>
      <div class="upload-box" id="diplomaBox">
        <input type="file" id="diplomaFile" accept="image/*" multiple onchange="diplomaChosen(this)"/>
        <div class="upload-box-icon">📜</div>
        <div class="upload-box-text">Upload your certificates</div>
        <div class="upload-box-hint">JPG, PNG (You can select multiple)</div>
      </div>
      <div id="diplomaList" style="margin-top:10px;display:flex;flex-direction:column;gap:6px;"></div>
    </div>`
);

// 5. Update v1()
content = content.replace(
  `// ─── Step 1 Validate ───
function v1(){
  const c = document.getElementById('country').value;
  const ph = document.getElementById('phone').value.trim();
  const prov = document.getElementById('province').value.trim();
  const city = document.getElementById('city').value.trim();
  const addr = document.getElementById('address').value.trim();

  if(!window.isPhoneVerified) return showErr('err1','Please verify your phone number with OTP first.');
  if(!c) return showErr('err1','Please select a country.');
  if(!ph) return showErr('err1','Please enter your mobile number.');
  if(!prov) return showErr('err1','Please enter your province/state.');
  if(!city) return showErr('err1','Please enter your city.');
  if(!addr) return showErr('err1','Please enter your complete address.');

  goStep(2);
}`,
  `// ─── Step 1 Validate ───
function v1(){
  const c = document.getElementById('country').value;
  const ph = document.getElementById('phone').value.trim();
  const prov = document.getElementById('province').value.trim();
  const city = document.getElementById('city').value.trim();
  const addr = document.getElementById('address').value.trim();
  const town = document.getElementById('town').value.trim();
  const street = document.getElementById('street').value.trim();

  if(!window.isPhoneVerified) return showErr('err1','Please verify your phone number with OTP first.');
  if(!c) return showErr('err1','Please select a country.');
  if(!ph) return showErr('err1','Please enter your mobile number.');
  if(!prov) return showErr('err1','Please enter your province/state.');
  if(!city) return showErr('err1','Please enter your city.');
  if(!addr) return showErr('err1','Please enter your complete address.');
  if(!town) return showErr('err1','Please enter your Town / Area.');
  if(!street) return showErr('err1','Please enter your Street.');

  goStep(2);
}`
);

// 6. Camera & Diploma JS
content = content.replace(
  `// ─── Password Match Indicator ───
function checkPass(){`,
  `// ─── Camera Logic ───
let currentCameraTarget = null;
let stream = null;

async function openCamera(fileInputId, boxId, nameId, chosenId){
  currentCameraTarget = { fileInputId, boxId, nameId, chosenId };
  const container = document.getElementById('cameraContainer');
  const video = document.getElementById('cameraVideo');
  container.style.display = 'block';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
  } catch(err) {
    alert("Camera access denied or unavailable.");
    closeCamera();
  }
}

function closeCamera(){
  const container = document.getElementById('cameraContainer');
  container.style.display = 'none';
  if(stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

function capturePhoto(){
  if(!currentCameraTarget || !stream) return;
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  canvas.toBlob(blob => {
    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileInput = document.getElementById(currentCameraTarget.fileInputId);
    fileInput.files = dataTransfer.files;
    
    document.getElementById(currentCameraTarget.nameId).textContent = "camera_capture.jpg";
    document.getElementById(currentCameraTarget.chosenId).style.display = 'flex';
    closeCamera();
  }, "image/jpeg", 0.9);
}

// ─── Diploma Logic ───
window.diplomaFilesArray = [];
function diplomaChosen(input){
  const list = document.getElementById('diplomaList');
  list.innerHTML = '';
  window.diplomaFilesArray = Array.from(input.files);
  window.diplomaFilesArray.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'file-chosen';
    div.style.display = 'flex';
    div.innerHTML = \`
      <span>✅</span><span style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${file.name}</span>
      <button class="file-remove" onclick="removeDiploma(\${idx})">×</button>
    \`;
    list.appendChild(div);
  });
}
window.removeDiploma = function(idx){
  window.diplomaFilesArray.splice(idx, 1);
  const dataTransfer = new DataTransfer();
  window.diplomaFilesArray.forEach(f => dataTransfer.items.add(f));
  document.getElementById('diplomaFile').files = dataTransfer.files;
  diplomaChosen(document.getElementById('diplomaFile'));
};

// ─── Password Match Indicator ───
function checkPass(){`
);

// 7. Init code
content = content.replace(
  `// ─── Init ───
window.addEventListener('load',()=>{
  updateRate(500);
});`,
  `// ─── Init ───
window.addEventListener('load',()=>{
  updateRate(500);
  updateCountryCode(); // Set default country code
});`
);

// 8. Upload diplomas logic
content = content.replace(
  `    let videoURL = '';
    const videoF = document.getElementById('videoFile').files[0];
    if(videoF){
      const r = ref(storage,\`workers/\${uid}/portfolio_video.mp4\`);
      await uploadBytes(r, videoF);
      videoURL = await getDownloadURL(r);
    }

    // ── 4. Collect Skills ──
    const skillInputs = document.querySelectorAll('.skill-input');`,
  `    let videoURL = '';
    const videoF = document.getElementById('videoFile').files[0];
    if(videoF){
      const r = ref(storage,\`workers/\${uid}/portfolio_video.mp4\`);
      await uploadBytes(r, videoF);
      videoURL = await getDownloadURL(r);
    }

    let diplomaURLs = [];
    if(window.diplomaFilesArray && window.diplomaFilesArray.length > 0){
      updateOverlay('Step 3/4','Uploading diplomas...');
      for(let i=0; i<window.diplomaFilesArray.length; i++){
        const dFile = window.diplomaFilesArray[i];
        const r = ref(storage, \`workers/\${uid}/diploma_\${i}.jpg\`);
        await uploadBytes(r, dFile);
        const dUrl = await getDownloadURL(r);
        diplomaURLs.push(dUrl);
      }
    }

    // ── 4. Collect Skills ──
    const skillInputs = document.querySelectorAll('.skill-input');`
);

// 9. Firestore DB object
content = content.replace(
  `      address:    document.getElementById('address').value.trim(),
      category:   document.getElementById('category').value,`,
  `      address:    document.getElementById('address').value.trim(),
      town:       document.getElementById('town').value.trim(),
      street:     document.getElementById('street').value.trim(),
      market:     document.getElementById('market').value.trim(),
      shopName:   document.getElementById('shopName').value.trim(),
      shopAddress:document.getElementById('shopAddress').value.trim(),
      category:   document.getElementById('category').value,`
);

// 10. add diplomaURLs to DB
content = content.replace(
  `      cnicFrontURL,
      cnicBackURL,
      videoURL,
      location:{`,
  `      cnicFrontURL,
      cnicBackURL,
      diplomaURLs,
      videoURL,
      location:{`
);

fs.writeFileSync('auth/worker-signup.html', content);
console.log('Successfully updated worker-signup.html');
