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
    const paths = document.querySelectorAll('.hero-decorations svg .doodle-path');
    
    // Explicit timings configuration for each segment:
    // Index 0: Top inside center circle
    // Index 1: Bottom inside center circle
    // Index 2: Top flower petals, stem, and leaves
    // Index 3: Bottom flower petals outline
    const config = [
      { delay: 50, duration: '0.25s' },  // Index 0: Top inside center circle (starts immediately)
      { delay: 900, duration: '0.25s' }, // Index 1: Bottom inside center circle (starts after top petals finish)
      { delay: 300, duration: '0.6s' },  // Index 2: Top flower petals, stem, and leaves (starts after top center finishes)
      { delay: 1150, duration: '0.6s' }  // Index 3: Bottom flower petals outline (starts after bottom center finishes)
    ];
    
    paths.forEach((path, index) => {
      // Calculate exact path length in user coordinate space
      const length = Math.ceil(path.getTotalLength());
      
      // Set initial hidden state (instantly, no transition)
      path.style.transition = 'none';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      
      // Force layout calculation/reflow to register the starting states
      void path.getBoundingClientRect();
      
      // Retrieve timing parameters for this specific path segment
      const timing = config[index] || { delay: 100 + index * 450, duration: '5.5s' };
      
      // Schedule the animation transition in a future paint frame
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${timing.duration} ease-in-out`;
        path.style.strokeDashoffset = '0';
      }, timing.delay);
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
