(function() {
  const styles = `
  .ai-fab {
    position: fixed; bottom: 30px; right: 30px; z-index: 9999;
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #F43F5E 0%, #be123c 100%);
    box-shadow: 0 8px 24px rgba(244,63,94,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: #fff; cursor: pointer;
    transition: transform 0.3s;
  }
  .ai-fab:hover { transform: scale(1.1) translateY(-5px); }
  
  .ai-widget {
    position: fixed; bottom: 100px; right: 30px; z-index: 9998;
    width: 350px; max-height: 500px; background: #fff;
    border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    border: 1.5px solid #F3D6E0; display: none;
    flex-direction: column; overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }
  .ai-widget.open { display: flex; animation: aiFadeUp 0.3s ease; }
  @keyframes aiFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  
  .ai-w-header {
    background: #FFE4EC; padding: 16px; border-bottom: 1px solid #F3D6E0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .ai-w-header h3 { font-size: 16px; font-weight: 700; color: #F43F5E; margin: 0; display:flex; align-items:center; gap:8px;}
  .ai-w-close { background: none; border: none; font-size: 20px; color: #9D7589; cursor: pointer; }
  
  .ai-w-chat {
    flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
    background: #fafafa; max-height: 350px;
  }
  .ai-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
  .ai-msg.bot { align-self: flex-start; background: #fff; border: 1.5px solid #F3D6E0; color: #1A0A14; border-bottom-left-radius: 4px; }
  .ai-msg.user { align-self: flex-end; background: #F43F5E; color: #fff; border-bottom-right-radius: 4px; }
  .ai-msg a { color: #F43F5E; font-weight: 600; text-decoration: underline; }
  
  .ai-w-input {
    display: flex; padding: 12px; border-top: 1px solid #F3D6E0; background: #fff; gap: 8px;
  }
  .ai-w-input input {
    flex: 1; padding: 10px 14px; border: 1.5px solid #F3D6E0; border-radius: 999px;
    font-size: 13px; outline: none; transition: border 0.2s;
  }
  .ai-w-input input:focus { border-color: #F43F5E; }
  .ai-w-input button {
    background: #F43F5E; color: #fff; border: none; width: 38px; height: 38px;
    border-radius: 50%; font-size: 16px; cursor: pointer;
  }
  `;

  const html = `
    <div class="ai-fab" id="aiFabBtn">🤖</div>
    <div class="ai-widget" id="aiWidget">
      <div class="ai-w-header">
        <h3>🤖 DoorSkill Helper</h3>
        <button class="ai-w-close" id="aiWCloseBtn">×</button>
      </div>
      <div class="ai-w-chat" id="aiWChat">
        <div class="ai-msg bot">Hi! I'm your DoorSkill Assistant. Ask me how to grow your business, get more leads, or use the platform!</div>
      </div>
      <form class="ai-w-input" id="aiWForm">
        <input type="text" id="aiWInput" placeholder="Type your question..." autocomplete="off"/>
        <button type="submit">➤</button>
      </form>
    </div>
  `;

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const fab = document.getElementById('aiFabBtn');
  const widget = document.getElementById('aiWidget');
  const closeBtn = document.getElementById('aiWCloseBtn');
  const form = document.getElementById('aiWForm');
  const input = document.getElementById('aiWInput');
  const chat = document.getElementById('aiWChat');

  function toggleAiWidget() {
    widget.classList.toggle('open');
  }

  fab.addEventListener('click', toggleAiWidget);
  closeBtn.addEventListener('click', toggleAiWidget);

  const AI_KNOWLEDGE = [
    { keys: ['lead', 'grow', 'increase', 'order', 'client'], reply: 'To get more leads and clients: 1) Add a high-quality profile picture. 2) List your skills clearly. 3) Ask past clients for 5-star reviews. 4) Share your profile link!' },
    { keys: ['register', 'join', 'signup', 'worker'], reply: 'You can easily register as a professional by visiting the Worker Signup Page. We accept ALL skills!' },
    { keys: ['post', 'job', 'hire', 'find'], reply: 'Need a service? Post a job for free and workers will bid on it.' },
    { keys: ['pay', 'money', 'fee', 'withdraw'], reply: 'Payments are secure. We hold the money in escrow until the job is done. You can withdraw directly to your local bank or mobile wallet from the dashboard.' },
    { keys: ['chat', 'message', 'contact'], reply: 'You can chat directly with clients or workers inside DoorSkill once a job is accepted, or if you click "Message" on their profile.' }
  ];

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    
    chat.innerHTML += '<div class="ai-msg user">' + escapeHtml(text) + '</div>';
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
    
    setTimeout(() => {
      let reply = 'I am not sure about that. Try asking how to "get leads", "register", or "post a job".';
      const lower = text.toLowerCase();
      for(const item of AI_KNOWLEDGE) {
        if(item.keys.some(k => lower.includes(k))) {
          reply = item.reply; break;
        }
      }
      chat.innerHTML += '<div class="ai-msg bot">' + reply + '</div>';
      chat.scrollTop = chat.scrollHeight;
    }, 600);
  });

  // Global Auth Check for Navbar
  const uid = localStorage.getItem('ds_uid');
  const role = localStorage.getItem('ds_role') || 'client';
  if (uid) {
    const dashLink = role === 'worker' ? 'dashboard/worker.html' : 'dashboard/client.html';
    
    // Update desktop nav buttons
    const navBtns = document.querySelector('.nav-btns');
    if (navBtns) {
      const loginBtn = navBtns.querySelector('a[href*="login.html"]');
      if (loginBtn) {
        loginBtn.textContent = 'Dashboard';
        loginBtn.href = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/dashboard/') || window.location.pathname.includes('/auth/') ? '../' + dashLink : dashLink;
      }
    }

    // Update mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      const mobileLogin = Array.from(mobileMenu.querySelectorAll('a')).find(a => a.href.includes('login.html'));
      if (mobileLogin) {
        mobileLogin.textContent = 'Dashboard';
        mobileLogin.href = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/dashboard/') || window.location.pathname.includes('/auth/') ? '../' + dashLink : dashLink;
      }
    }
  }
})();
