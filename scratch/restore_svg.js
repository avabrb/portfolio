const fs = require('fs');
const path = require('path');

const originalSvgPath = '/Users/famoco/Desktop/portfolio/public/icons/flower_decor.svg';
const indexHtmlPath = '/Users/famoco/Desktop/portfolio/index.html';

try {
  // 1. Read and prepare the clean SVG from the original file
  let originalSvg = fs.readFileSync(originalSvgPath, 'utf8').trim();

  // Remove the legacy eraser mask to restore visibility
  originalSvg = originalSvg.replace(/mask="url\(#react-sketch-canvas__eraser-mask-0\)"/, '');

  // Add the viewBox to support proportional scaling inside the container
  originalSvg = originalSvg.replace(/<svg\s+/, '<svg viewBox="0 0 230 230" ');

  // 2. Read the current HTML
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Find the hero-decorations container and replace its SVG content
  const startTag = '<div class="hero-decorations">';
  const endTag = '</div>';
  
  const startIndex = html.indexOf(startTag);
  const endIndex = html.indexOf(endTag, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find hero-decorations container in index.html');
  }

  // Replace content between startTag and endTag
  const before = html.substring(0, startIndex + startTag.length);
  const after = html.substring(endIndex);
  
  // Format with clean spacing
  const updatedHtml = before + '\n              ' + originalSvg + '\n            ' + after;

  fs.writeFileSync(indexHtmlPath, updatedHtml);
  console.log('SVG content successfully restored from original file to index.html!');

} catch (err) {
  console.error('Error restoring SVG:', err);
}
