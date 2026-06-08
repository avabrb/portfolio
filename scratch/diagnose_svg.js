const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Starting diagnostic script...');
  let logContent = '=== SVG Doodle Diagnostic Logs ===\n\n';

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Catch page console logs
    page.on('console', msg => {
      console.log(`[BROWSER LOG]: ${msg.text()}`);
      logContent += `[BROWSER LOG]: ${msg.type().toUpperCase()}: ${msg.text()}\n`;
    });

    page.on('pageerror', err => {
      console.error(`[BROWSER ERROR]: ${err.toString()}`);
      logContent += `[BROWSER ERROR]: ${err.toString()}\n`;
    });

    console.log('Navigating to http://localhost:5175/...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });

    // Wait for the window load event animations to proceed
    console.log('Waiting 1.5 seconds for animation stagger delays...');
    await page.waitForTimeout(1500);

    // Evaluate SVG path details
    const pathDetails = await page.evaluate(() => {
      const paths = document.querySelectorAll('.hero-decorations svg path');
      return Array.from(paths).map((path, index) => {
        return {
          index,
          d: path.getAttribute('d').substring(0, 60) + '...',
          totalLength: path.getTotalLength(),
          stroke: getComputedStyle(path).stroke,
          strokeWidth: getComputedStyle(path).strokeWidth,
          strokeDasharray: path.style.strokeDasharray,
          strokeDashoffset: path.style.strokeDashoffset,
          transition: path.style.transition,
          visibility: getComputedStyle(path).visibility,
          display: getComputedStyle(path).display,
          opacity: getComputedStyle(path).opacity,
          bbox: path.getBBox()
        };
      });
    });

    logContent += '\n=== Path Elements Details ===\n';
    pathDetails.forEach(p => {
      logContent += `\nPath ${p.index}:\n`;
      logContent += `  Start coordinate: ${p.d}\n`;
      logContent += `  getTotalLength(): ${p.totalLength}\n`;
      logContent += `  Bounding Box: x=${p.bbox.x}, y=${p.bbox.y}, w=${p.bbox.width}, h=${p.bbox.height}\n`;
      logContent += `  Style Stroke: ${p.stroke} (${p.strokeWidth})\n`;
      logContent += `  Style Visibility: ${p.visibility}, Display: ${p.display}, Opacity: ${p.opacity}\n`;
      logContent += `  Inline Dasharray: ${p.strokeDasharray}\n`;
      logContent += `  Inline Dashoffset: ${p.strokeDashoffset}\n`;
      logContent += `  Inline Transition: ${p.transition}\n`;
    });

    await browser.close();
    console.log('Diagnostic checks complete.');
  } catch (err) {
    console.error('Fatal error during diagnostic:', err);
    logContent += `\n[FATAL ERROR]: ${err.stack}\n`;
  }

  const destPath = path.join(__dirname, 'diagnostic_results.txt');
  fs.writeFileSync(destPath, logContent);
  console.log(`Results written to ${destPath}`);
}

run();
