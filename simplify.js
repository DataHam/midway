import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const newStyleBlock = `
    @media (min-width: 768px) {
      .hero { min-height: 50vh; }
      .hero-photo { object-position: 45% 42%; }
    }
`;

html = html.replace(/@media \(min-width: 768px\) \{[\s\S]*?object-position: 45% 35%; \}\n\s*\}/g, newStyleBlock.trim());
fs.writeFileSync('index.html', html);
