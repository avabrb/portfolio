/**
 * magnetic.js — premium magnetic button micro-interactions
 *
 * Smoothly pulls CTA buttons and header links towards the cursor when hovering nearby.
 * Returns to origin smoothly when mouse leaves. Highly optimized requestAnimationFrame loop.
 */

(function () {
  'use strict';

  // CSS selectors for target elements to track
  const TARGETS = ['.hero-btn', '.linkedin-btn', '.home-btn'];

  // Interaction settings
  const THRESHOLD = 80;     // distance threshold (px) to trigger magnetic pull
  const STRENGTH = 0.35;    // movement strength (percentage of distance from center)
  const LERP_FACTOR = 0.12; // smoothing factor (lower is slower/smoother)

  const elements = [];

  /**
   * Scans DOM for target selectors and initializes tracking configurations.
   */
  function initElements() {
    TARGETS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Ensure element transitions don't fight custom transform updates during hover
        el.style.willChange = 'transform';
        elements.push({
          el,
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0,
          active: false
        });
      });
    });
  }

  // Linear interpolation function
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  // Mouse coordinate state
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let rafId = null;

  /**
   * Main animation loop updating coordinate values and transforms.
   */
  function animate() {
    let anyActive = false;

    elements.forEach(item => {
      const rect = item.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const distance = Math.hypot(dx, dy);

      if (distance < THRESHOLD) {
        item.targetX = dx * STRENGTH;
        item.targetY = dy * STRENGTH;
        item.active = true;
      } else {
        item.targetX = 0;
        item.targetY = 0;
        // Snap to zero if offset becomes negligible
        if (Math.abs(item.x) < 0.05 && Math.abs(item.y) < 0.05) {
          item.x = 0;
          item.y = 0;
          item.active = false;
        }
      }

      if (item.active || item.x !== 0 || item.y !== 0) {
        item.x = lerp(item.x, item.targetX, LERP_FACTOR);
        item.y = lerp(item.y, item.targetY, LERP_FACTOR);
        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
        anyActive = true;
      } else {
        item.el.style.transform = '';
      }
    });

    if (anyActive) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  // Kickstart animation loop when mouse moves
  window.addEventListener('mousemove', () => {
    if (!rafId && elements.length > 0) {
      rafId = requestAnimationFrame(animate);
    }
  });

  // Handle touch events gracefully on mobile/tablet (disable magnetic pull on touch)
  window.addEventListener('touchstart', () => {
    elements.forEach(item => {
      item.targetX = 0;
      item.targetY = 0;
      item.x = 0;
      item.y = 0;
      item.el.style.transform = '';
    });
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  // Start initialization
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initElements();
  } else {
    window.addEventListener('DOMContentLoaded', initElements);
  }

  console.log('[magnetic.js] Loaded. Active elements tracked:', elements.length);
})();
