const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Prices logic:
// Fast food: $50 - $100
// Drinks: $30 - $60
// Desserts: $40 - $80
// Pizza: $100 - $250
// BBQ: $150 - $400
// Main: $200 - $800

function getLuxuryPrice(category) {
    let min, max;
    switch(category) {
        case 'fast-food': min=50; max=120; break;
        case 'drinks': min=35; max=75; break;
        case 'dessert': min=45; max=90; break;
        case 'pizza': min=120; max=250; break;
        case 'bbq': min=150; max=450; break;
        case 'main': min=200; max=850; break;
        default: min=50; max=100;
    }
    // Round to nearest 5
    return Math.round((Math.random() * (max - min) + min) / 5) * 5;
}

const arrayRegex = /(const initialMenuItemsToSeed = \[)([\s\S]*?)(\];)/;
html = html.replace(arrayRegex, (match, p1, p2, p3) => {
    let updatedItems = p2.replace(/price: (\d+), category: "(.*?)"/g, (m, oldPrice, category) => {
        let newPrice = getLuxuryPrice(category);
        return `price: ${newPrice}, category: "${category}"`;
    });
    return p1 + updatedItems + p3;
});

fs.writeFileSync('index.html', html, 'utf8');
console.log('Prices updated to luxury level');
