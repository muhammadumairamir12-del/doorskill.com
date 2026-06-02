const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dashboard/client.html');
let content = fs.readFileSync(filePath, 'utf8');

const target = `<div style="display:grid;grid-template-columns:1fr 1fr;
                        gap:8px;">
              <a href="../pages/find-workers.html?q=Plumber"
                 class="shortcut-item">
                <span class="si-icon">🪛</span>
                <span class="si-label">Plumber</span>
              </a>
              <a href="../pages/find-workers.html?q=Electrician"
                 class="shortcut-item">
                <span class="si-icon">⚡</span>
                <span class="si-label">Electrician</span>
              </a>
              <a href="../pages/find-workers.html?q=Doctor"
                 class="shortcut-item">
                <span class="si-icon">👨‍⚕️</span>
                <span class="si-label">Doctor</span>
              </a>
              <a href="../pages/find-workers.html?q=Teacher"
                 class="shortcut-item">
                <span class="si-icon">📚</span>
                <span class="si-label">Teacher</span>
              </a>
              <a href="../pages/find-workers.html?q=Laptop Repair"
                 class="shortcut-item">
                <span class="si-icon">💻</span>
                <span class="si-label">IT Repair</span>
              </a>
              <a href="../pages/find-workers.html"
                 class="shortcut-item">
                <span class="si-icon">✨</span>
                <span class="si-label">View All</span>
              </a>
            </div>`;

const replacement = `<div style="display:grid;grid-template-columns:1fr 1fr;
                        gap:8px;">
              <a href="../pages/find-workers.html?q=Plumber"
                 class="shortcut-item">
                <span class="si-icon">🔧</span>
                <span class="si-label">Plumber</span>
              </a>
              <a href="../pages/find-workers.html?q=Electrician"
                 class="shortcut-item">
                <span class="si-icon">⚡</span>
                <span class="si-label">Electrician</span>
              </a>
              <a href="../pages/find-workers.html?q=Cleaner"
                 class="shortcut-item">
                <span class="si-icon">🧹</span>
                <span class="si-label">Cleaning</span>
              </a>
              <a href="../pages/find-workers.html?q=Mechanic"
                 class="shortcut-item">
                <span class="si-icon">🚗</span>
                <span class="si-label">Mechanic</span>
              </a>
              <a href="../pages/find-workers.html?q=Mover"
                 class="shortcut-item">
                <span class="si-icon">🚚</span>
                <span class="si-label">Mover/Helper</span>
              </a>
              <a href="../pages/find-workers.html"
                 class="shortcut-item">
                <span class="si-icon">✨</span>
                <span class="si-label">View All</span>
              </a>
            </div>`;

const targetNormalized = target.replace(/\r?\n/g, '\n');
const contentNormalized = content.replace(/\r?\n/g, '\n');

if (contentNormalized.includes(targetNormalized)) {
  content = contentNormalized.replace(targetNormalized, replacement);
  console.log("Successfully replaced category shortcuts in dashboard/client.html!");
} else {
  console.error("Category shortcuts target in dashboard/client.html not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("dashboard/client.html updated successfully!");
