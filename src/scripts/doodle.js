/**
 * doodle.js — premium SVG path sketching animation
 *
 * Dynamically measures the geometric length of each path inside the hero SVG
 * and animates the stroke-dashoffset to ensure smooth, organic drawing transitions.
 * Waits for the window load event to guarantee accurate path measurements.
 */

(function () {
  'use strict';

  function initDoodle() {
    const paths = document.querySelectorAll('.hero-decorations svg path');
    
    paths.forEach((path, index) => {
      // Calculate exact path length in user coordinate space
      const length = Math.ceil(path.getTotalLength());
      
      // Set initial hidden state (instantly, no transition)
      path.style.transition = 'none';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      
      // Force layout calculation/reflow to register the starting states
      void path.getBoundingClientRect();
      
      // Schedule the animation transition in a future paint frame
      const delayMs = 100 + index * 450;
      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 3.2s cubic-bezier(0.16, 1, 0.3, 1)';
        path.style.strokeDashoffset = '0';
      }, delayMs);
    });
  }

  // Wait for full window load to guarantee CSS layout is fully rendered
  // so path.getTotalLength() returns 100% accurate measurements in all browsers.
  if (document.readyState === 'complete') {
    initDoodle();
  } else {
    window.addEventListener('load', initDoodle);
  }
})();
