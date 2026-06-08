const fs = require('fs');
const path = require('path');

const originalSvgPath = '/Users/famoco/Desktop/portfolio/public/icons/flower_decor.svg';
const indexHtmlPath = '/Users/famoco/Desktop/portfolio/index.html';

try {
  const originalSvg = fs.readFileSync(originalSvgPath, 'utf8');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Regex to match path elements
  const pathRegex = /<path\s+[^>]*d="([^"]+)"/g;
  
  const originalPaths = [];
  let match;
  while ((match = pathRegex.exec(originalSvg)) !== null) {
    originalPaths.push(match[1]);
  }

  const inlinedPaths = [];
  while ((match = pathRegex.exec(indexHtml)) !== null) {
    inlinedPaths.push(match[1]);
  }

  console.log(`Original SVG paths count: ${originalPaths.length}`);
  console.log(`Inlined HTML paths count: ${inlinedPaths.length}`);

  if (originalPaths.length !== inlinedPaths.length) {
    console.log('WARNING: Path counts do not match!');
  }

  originalPaths.forEach((p, i) => {
    const ip = inlinedPaths[i] || '';
    if (p === ip) {
      console.log(`Path ${i + 1} matches exactly (Length: ${p.length} chars)`);
    } else {
      console.log(`Path ${i + 1} DOES NOT MATCH!`);
      console.log(`  Original length: ${p.length}`);
      console.log(`  Inlined length: ${ip.length}`);
      console.log(`  Original starts with: ${p.substring(0, 30)}`);
      console.log(`  Inlined starts with: ${ip.substring(0, 30)}`);
    }
  });

} catch (err) {
  console.error('Error comparing SVG files:', err);
}
