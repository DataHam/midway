import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

// Replace the existing media queries I added
const oldStyleBlock = `
    @media (min-width: 768px) {
      .hero { min-height: 50vh; }
      .hero-photo { object-position: 42% 22%; }
    }
    @media (min-width: 1024px) {
      .hero { min-height: 60vh; }
      .hero-photo { object-position: 42% 18%; }
    }
    @media (min-width: 1440px) {
      .hero { min-height: 70vh; }
      .hero-photo { object-position: 42% 15%; }
    }
`;

const newStyleBlock = `
    @media (min-width: 768px) {
      .hero { min-height: 55vh; }
      .hero-photo { object-position: 45% 35%; }
    }
    @media (min-width: 1024px) {
      .hero { min-height: 55vh; }
      .hero-photo { object-position: 45% 35%; }
    }
    @media (min-width: 1440px) {
      .hero { min-height: 55vh; }
      .hero-photo { object-position: 45% 35%; }
    }
`;

// It's safer to just do a string replace of the block if it matches, or use regex
html = html.replace(/@media \(min-width: 768px\) \{[\s\S]*?object-position: 42% 15%; \}\n\s*\}/g, newStyleBlock.trim());
fs.writeFileSync('index.html', html);
