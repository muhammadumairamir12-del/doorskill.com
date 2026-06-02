const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dashboard/worker.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rebrand Job Board filter dropdown (around line 1071)
const filterTarget = `<option value="">All Categories</option>
            <option>🔧 Home Repairs</option>
            <option>📚 Education</option>
            <option>🏥 Health</option>
            <option>💄 Beauty</option>
            <option>🧹 Cleaning</option>
            <option>💻 IT &amp; Tech</option>
            <option>🚗 Auto Services</option>
            <option>Other</option>`;

const filterReplacement = `<option value="">All Categories</option>
            <option value="Home Repairs">🔧 Home Repairs</option>
            <option value="Cleaning">🧹 Cleaning</option>
            <option value="Auto Services">🚗 Auto Services</option>
            <option value="Beauty">💄 Beauty</option>
            <option value="Logistics & Helpers">🚚 Logistics & Helpers</option>
            <option value="Other Local Services">✨ Other Local Services</option>`;

if (content.includes(filterTarget)) {
  content = content.replace(filterTarget, filterReplacement);
  console.log("Successfully rebranded Job Board filter dropdown!");
} else {
  // Let's try line-normalized matching
  const filterTargetNormalized = filterTarget.replace(/\r?\n/g, '\n');
  const contentNormalized = content.replace(/\r?\n/g, '\n');
  if (contentNormalized.includes(filterTargetNormalized)) {
    content = contentNormalized.replace(filterTargetNormalized, filterReplacement);
    console.log("Successfully rebranded Job Board filter dropdown (normalized line endings)!");
  } else {
    console.error("Job Board filter dropdown target not found!");
  }
}

// 2. Rebrand Profile Edit category dropdown (around line 1255)
const editTarget = `<select id="editCategory">
              <option>🔧 Home Repairs</option>
              <option>📚 Education</option>
              <option>🏥 Health</option>
              <option>💄 Beauty</option>
              <option>🧹 Cleaning</option>
              <option>💻 IT &amp; Tech</option>
              <option>🚗 Auto Services</option>
              <option>🍳 Food &amp; Chef</option>
              <option>🏗️ Construction</option>
              <option>📈 Business Services</option>
              <option>Other</option>
            </select>`;

const editReplacement = `<select id="editCategory">
              <option value="Home Repairs">🔧 Home Repairs</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Auto Services">🚗 Auto Services</option>
              <option value="Beauty">💄 Beauty</option>
              <option value="Logistics & Helpers">🚚 Logistics &amp; Helpers</option>
              <option value="Other Local Services">✨ Other Local Services</option>
            </select>`;

if (content.includes(editTarget)) {
  content = content.replace(editTarget, editReplacement);
  console.log("Successfully rebranded Profile Edit category dropdown!");
} else {
  // Let's try line-normalized matching
  const editTargetNormalized = editTarget.replace(/\r?\n/g, '\n');
  const contentNormalized = content.replace(/\r?\n/g, '\n');
  if (contentNormalized.includes(editTargetNormalized)) {
    content = contentNormalized.replace(editTargetNormalized, editReplacement);
    console.log("Successfully rebranded Profile Edit category dropdown (normalized line endings)!");
  } else {
    console.error("Profile Edit category dropdown target not found!");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("dashboard/worker.html updated successfully!");
