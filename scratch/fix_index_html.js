const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings for replacement
const normalizeLineEndings = (str) => str.replace(/\r?\n/g, '\n');
content = normalizeLineEndings(content);

const replacements = [
  {
    target: `Browse top-rated freelancers and local service experts from around the world.`,
    replacement: `Browse top-rated local service experts and tradespeople in your area.`
  },
  {
    target: `<div class="section-tag" style="margin-bottom:12px;">Global Reach</div>`,
    replacement: `<div class="section-tag" style="margin-bottom:12px;">Local Reach</div>`
  },
  {
    target: `Available in Any City, <span>Worldwide</span>`,
    replacement: `Available in Any City, <span>Locally</span>`
  },
  {
    target: `Explore our network of professionals. Click on a city or any pin to view workers.`,
    replacement: `Explore our network of professionals. Click on a city or any pin to view local workers.`
  },
  {
    target: `<p>Real data from our growing global platform</p>`,
    replacement: `<p>Real data from our growing local trade marketplace</p>`
  },
  {
    target: `Empowering Local Professionals Globally`,
    replacement: `Empowering Local Trade Professionals`
  },
  {
    target: `DoorSkill is an innovative marketplace connecting everyday people with highly skilled, verified professionals in their local communities.`,
    replacement: `DoorSkill is an innovative marketplace connecting everyday people with highly skilled, verified trade professionals in their local communities.`
  },
  {
    target: `Whether you need a trusted plumber in Multan, a math tutor in Lahore, or an IT expert across the world, DoorSkill brings them directly to your digital doorstep.`,
    replacement: `Whether you need a trusted plumber, electrician, AC mechanic, or cleaner in your city, DoorSkill brings them directly to your digital doorstep.`
  }
];

replacements.forEach(({ target, replacement }, idx) => {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Successfully replaced text item ${idx + 1}!`);
  } else {
    console.warn(`Text item ${idx + 1} not found!`);
  }
});

// Replace the SEARCH_DATA array
const searchDataTarget = `let SEARCH_DATA = [
  {icon:'🪛',name:'Plumber',cat:'Home Repairs'},
  {icon:'⚡',name:'Electrician',cat:'Home Repairs'},
  {icon:'🪚',name:'Carpenter',cat:'Home Repairs'},
  {icon:'🖌️',name:'Painter',cat:'Home Repairs'},
  {icon:'❄️',name:'AC Repair',cat:'Home Repairs'},
  {icon:'🔩',name:'Welder',cat:'Home Repairs'},
  {icon:'➕',name:'Math Teacher',cat:'Education'},
  {icon:'🔬',name:'Science Teacher',cat:'Education'},
  {icon:'🗣️',name:'English Tutor',cat:'Education'},
  {icon:'📖',name:'Quran Tutor',cat:'Education'},
  {icon:'💻',name:'Coding Tutor',cat:'Education'},
  {icon:'👨‍⚕️',name:'Doctor',cat:'Health'},
  {icon:'🦷',name:'Dentist',cat:'Health'},
  {icon:'🤸',name:'Physiotherapist',cat:'Health'},
  {icon:'🥗',name:'Nutritionist',cat:'Health'},
  {icon:'👩‍⚕️',name:'Nurse',cat:'Health'},
  {icon:'✂️',name:'Salon at Home',cat:'Beauty'},
  {icon:'💋',name:'Makeup Artist',cat:'Beauty'},
  {icon:'💈',name:'Barber',cat:'Beauty'},
  {icon:'💅',name:'Manicure',cat:'Beauty'},
  {icon:'🏠',name:'Home Cleaning',cat:'Cleaning'},
  {icon:'🛋️',name:'Sofa Cleaning',cat:'Cleaning'},
  {icon:'🔲',name:'Carpet Cleaning',cat:'Cleaning'},
  {icon:'🍳',name:'Kitchen Deep Clean',cat:'Cleaning'},
  {icon:'🖥️',name:'Laptop Repair',cat:'IT & Tech'},
  {icon:'📱',name:'Mobile Repair',cat:'IT & Tech'},
  {icon:'📡',name:'Internet Setup',cat:'IT & Tech'},
  {icon:'💾',name:'Software Install',cat:'IT & Tech'},
  {icon:'🔩',name:'Car Mechanic',cat:'Auto Services'},
  {icon:'🏍️',name:'Bike Mechanic',cat:'Auto Services'},
  {icon:'🚿',name:'Car Wash',cat:'Auto Services'},
  {icon:'🍳',name:'Chef',cat:'Other'},
  {icon:'🚗',name:'Driver',cat:'Other'},
  {icon:'💼',name:'Freelancer',cat:'Other'},
  {icon:'👮',name:'Security Guard',cat:'Other'},
  {icon:'📊',name:'Accountant',cat:'Other'},
  {icon:'⚖️',name:'Lawyer',cat:'Other'},
  {icon:'🎨',name:'Graphic Designer',cat:'Other'},
  {icon:'📸',name:'Photographer',cat:'Other'},
];`;

const searchDataReplacement = `let SEARCH_DATA = [
  {icon:'🪛',name:'Plumber',cat:'Home Repairs'},
  {icon:'⚡',name:'Electrician',cat:'Home Repairs'},
  {icon:'🪚',name:'Carpenter',cat:'Home Repairs'},
  {icon:'🖌️',name:'Painter',cat:'Home Repairs'},
  {icon:'❄️',name:'AC Repair',cat:'Home Repairs'},
  {icon:'🔩',name:'Welder',cat:'Home Repairs'},
  {icon:'✂️',name:'Salon at Home',cat:'Beauty'},
  {icon:'💋',name:'Makeup Artist',cat:'Beauty'},
  {icon:'💈',name:'Barber',cat:'Beauty'},
  {icon:'💅',name:'Manicure',cat:'Beauty'},
  {icon:'🏠',name:'Home Cleaning',cat:'Cleaning'},
  {icon:'🛋️',name:'Sofa Cleaning',cat:'Cleaning'},
  {icon:'🔲',name:'Carpet Cleaning',cat:'Cleaning'},
  {icon:'🍳',name:'Kitchen Deep Clean',cat:'Cleaning'},
  {icon:'🔩',name:'Car Mechanic',cat:'Auto Services'},
  {icon:'🏍️',name:'Bike Mechanic',cat:'Auto Services'},
  {icon:'🚿',name:'Car Wash',cat:'Auto Services'},
  {icon:'🍳',name:'Chef',cat:'Other Local Services'},
  {icon:'🚗',name:'Driver',cat:'Logistics & Helpers'},
  {icon:'📦',name:'Mover & Packer',cat:'Logistics & Helpers'},
  {icon:'👮',name:'Security Guard',cat:'Logistics & Helpers'},
  {icon:'🪴',name:'Gardener',cat:'Other Local Services'},
  {icon:'🕷️',name:'Pest Control',cat:'Other Local Services'},
];`;

if (content.includes(searchDataTarget)) {
  content = content.replace(searchDataTarget, searchDataReplacement);
  console.log("Successfully replaced SEARCH_DATA autocomplete array!");
} else {
  console.error("SEARCH_DATA autocomplete array target not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("index.html updated successfully!");
