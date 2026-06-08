/**
 * trail.js — interactive flower image trail effect
 *
 * Spawns flower images following the user's cursor inside the hero section.
 * Smoothly interpolates positions for quick pointer movements and cycles
 * through all 15 flower images.
 */

(function () {
  'use strict';

  // Distance threshold (in pixels) the cursor must move before dropping a new flower
  const DISTANCE_THRESHOLD = 80;

  // List of all 15 flower image paths
  const flowerImages = [
    '/images/flowers/8.png',
    '/images/flowers/9.png',
    '/images/flowers/10.png',
    '/images/flowers/11.png',
    '/images/flowers/12.png',
    '/images/flowers/13.png',
    '/images/flowers/14.png',
    '/images/flowers/15.png',
    '/images/flowers/16.png',
    '/images/flowers/17.png',
    '/images/flowers/18.png',
    '/images/flowers/19.png',
    '/images/flowers/20.png',
    '/images/flowers/21.png',
    '/images/flowers/22.png'
  ];

  // DOM references
  const hero = document.getElementById('hero');
  const container = document.getElementById('hero-trail-container');

  if (!hero || !container) return;

  // State variables
  let lastX = 0;
  let lastY = 0;
  let hasMoved = false;
  let currentIndex = 0;

  // Preload all flower images asynchronously after page layout is ready
  // to avoid flashing or delay on first hover.
  if (document.readyState === 'complete') {
    preloadFlowers();
  } else {
    window.addEventListener('load', preloadFlowers);
  }

  function preloadFlowers() {
    flowerImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  /**
   * Spawns a single flower image at target coordinate relative to the hero section.
   */
  function spawnFlower(x, y) {
    const img = document.createElement('img');
    img.src = flowerImages[currentIndex];
    img.className = 'trail-image';

    // Organic variations
    const rotation = (Math.random() - 0.5) * 50; // Random angle from -25deg to 25deg
    const scale = 0.8 + Math.random() * 0.4;    // Random scale from 0.8 to 1.2

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.setProperty('--rotation', `${rotation}deg`);
    img.style.setProperty('--scale', `${scale}`);

    // Cycle to next flower image
    currentIndex = (currentIndex + 1) % flowerImages.length;

    // Self-destruct when CSS animation completes to prevent DOM bloat
    img.addEventListener('animationend', () => {
      img.remove();
    });

    container.appendChild(img);
  }

  /**
   * Handles cursor/pointer movement, calculating distance and spawning
   * intermediate flowers if needed to maintain a dense trail.
   */
  function handleMove(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (!hasMoved) {
      lastX = x;
      lastY = y;
      hasMoved = true;
      spawnFlower(x, y);
      return;
    }

    const dx = x - lastX;
    const dy = y - lastY;
    const distance = Math.hypot(dx, dy);

    if (distance >= DISTANCE_THRESHOLD) {
      // Interpolate positions to keep the trail smooth during fast pointer movements
      const steps = Math.floor(distance / DISTANCE_THRESHOLD);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interpolX = lastX + dx * t;
        const interpolY = lastY + dy * t;
        spawnFlower(interpolX, interpolY);
      }
      lastX = x;
      lastY = y;
    }
  }

  // Register mouse movements in hero
  hero.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  // Register touch support for mobile/tablets
  hero.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Reset tracking on leave to prevent connecting lines when cursor re-enters
  hero.addEventListener('mouseleave', () => {
    hasMoved = false;
  });

  console.log('[trail.js] Interactive image trail initialized inside hero section.');
})();
