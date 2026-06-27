import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');
let styleBlock = `
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
html = html.replace(/@media \(min-width: 768px\) \{\n\s*\.hero \{ min-height: 50vh; \}\n\s*\.hero-photo \{ object-position: 42% 22%; \}\n\s*\}/g, styleBlock.trim());
fs.writeFileSync('index.html', html);
