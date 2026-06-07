/**
 * physics.js — flower gravity simulation
 *
 * Clicking anywhere in the projects-container causes every [data-physics="true"]
 * flower to fall with gravity, bounce, and settle on a virtual floor.
 * Project-link flowers (<a> tags) are left untouched.
 */

(function () {
  'use strict';

  /* ── config ─────────────────────────────────────────────── */
  const GRAVITY        = 0.55;  // px/frame²
  const BOUNCE_DAMP    = 0.42;  // energy retained after floor bounce
  const SPIN_DAMP      = 0.88;  // rotational damping per frame
  const LATERAL_DAMP   = 0.96;  // horizontal friction on floor contact
  const SETTLE_VEL     = 0.8;   // speed below which a body is considered settled
  const FLOOR_RATIO    = 0.37;  // floor is this fraction from the container bottom
  const STAGGER_MS     = 60;    // ms between each flower's staggered launch
  const NUDGE_MIN      = -2.5;
  const NUDGE_MAX      =  2.5;
  const INITIAL_VY_MIN =  1;
  const INITIAL_VY_MAX =  3;
  const INITIAL_SPIN   =  3;    // max initial rotation speed (deg/frame)

  /* ── state ───────────────────────────────────────────────── */
  let triggered = false;
  let rafId     = null;
  let bodies    = [];

  /* ── helpers ─────────────────────────────────────────────── */
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  /* ── dom refs ────────────────────────────────────────────── */
  const container = document.getElementById('projects-container');
  const hintEl    = document.querySelector('.physics-hint');

  if (!container) return;

  /**
   * Returns the visual bounds of a flower element, accounting for
   * object-fit:contain — so the physics body matches the *visible*
   * image content, not the (possibly taller) element box.
   */
  function getVisualRect(el, containerRect) {
    const r   = el.getBoundingClientRect();
    const img = el.querySelector('img');

    let yOff = 0;
    let h    = r.height;

    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      const natAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = r.width / r.height;

      if (natAspect > boxAspect) {
        // Image is wider → constrained by element width; empty space top & bottom
        const renderedH = r.width / natAspect;
        yOff = (r.height - renderedH) / 2; // center of the gap above the image
        h    = renderedH;
      }
      // natAspect <= boxAspect: image fills the full height → no adjustment
    }

    return {
      x: r.left - containerRect.left,
      y: r.top  - containerRect.top + yOff,
      w: r.width,
      h,
    };
  }

  /* ── launch physics ──────────────────────────────────────── */
  function triggerPhysics() {
    if (triggered) return;
    triggered = true;

    container.classList.add('physics-triggered', 'physics-active');

    // Wiggle the hint text
    if (hintEl) {
      hintEl.classList.remove('do-wiggle');
      void hintEl.offsetWidth;
      hintEl.classList.add('do-wiggle');
    }

    const containerRect = container.getBoundingClientRect();
    const floorY        = container.offsetHeight * (1 - FLOOR_RATIO);
    const containerW    = containerRect.width;

    const physicsEls = [...container.querySelectorAll('[data-physics="true"]')];

    // Snapshot ALL visual rects synchronously before any stagger delays
    const rects = physicsEls.map(el => getVisualRect(el, containerRect));

    physicsEls.forEach((el, i) => {
      setTimeout(() => {
        const { x, y, w, h } = rects[i];

        // Pin element at its computed visual position
        el.style.left      = x + 'px';
        el.style.top       = y + 'px';
        el.style.width     = w + 'px';
        el.style.height    = h + 'px';
        el.style.right     = 'auto';
        el.style.bottom    = 'auto';
        el.style.transform = 'none';

        el.classList.add('is-falling');

        bodies.push({
          el,
          x, y, w, h,
          vx:       rand(NUDGE_MIN, NUDGE_MAX),
          vy:       rand(INITIAL_VY_MIN, INITIAL_VY_MAX),
          angle:    0,
          spin:     rand(-INITIAL_SPIN, INITIAL_SPIN),
          settled:  false,
          floorY,
          containerW,
        });

        // Restart RAF if it stopped before this body was added
        // (RAF fires before setTimeout(0) in the event loop)
        if (!rafId) {
          rafId = requestAnimationFrame(step);
        }
      }, i * STAGGER_MS);
    });
  }

  /* ── simulation step ─────────────────────────────────────── */
  function step() {
    let anyActive = false;

    bodies.forEach(b => {
      if (b.settled) return;

      b.vy    += GRAVITY;
      b.x     += b.vx;
      b.y     += b.vy;
      b.angle += b.spin;

      const floorContact = b.floorY - b.h;

      // Floor collision
      if (b.y >= floorContact) {
        b.y  = floorContact;
        b.vy = -(b.vy * BOUNCE_DAMP);
        b.vx *= LATERAL_DAMP;
        b.spin *= SPIN_DAMP;

        if (Math.abs(b.vy) < SETTLE_VEL && Math.abs(b.vx) < SETTLE_VEL) {
          b.vy      = 0;
          b.vx      = 0;
          b.spin    = 0;
          b.settled = true;
          b.el.classList.remove('is-falling');
          b.el.classList.add('is-landed');
        }
      }

      // Wall collisions
      if (b.x < 0) {
        b.x  = 0;
        b.vx = Math.abs(b.vx) * BOUNCE_DAMP;
        b.spin *= -0.6;
      } else if (b.x + b.w > b.containerW) {
        b.x  = b.containerW - b.w;
        b.vx = -Math.abs(b.vx) * BOUNCE_DAMP;
        b.spin *= -0.6;
      }

      b.el.style.left      = b.x + 'px';
      b.el.style.top       = b.y + 'px';
      b.el.style.transform = `rotate(${b.angle}deg)`;

      if (!b.settled) anyActive = true;
    });

    if (anyActive) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
    }
  }

  /* ── reset ───────────────────────────────────────────────── */
  // Clears all inline styles so the original percentage-based CSS takes over.
  // This works correctly at any viewport size (no stale pixel values).
  function reset() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    bodies.forEach(b => {
      b.el.classList.remove('is-falling', 'is-landed');
      b.el.style.left      = '';
      b.el.style.top       = '';
      b.el.style.right     = '';
      b.el.style.bottom    = '';
      b.el.style.width     = '';
      b.el.style.height    = '';
      b.el.style.transform = '';
    });

    bodies = [];
    container.classList.remove('physics-triggered', 'physics-active');
    triggered = false;
  }

  /* ── event listeners ─────────────────────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastTouchEnd = 0;

  function handleTrigger(e) {
    if (e.target.closest('a.project-link')) return;
    if (prefersReduced.matches) return;
    if (e.type === 'click' && Date.now() - lastTouchEnd < 600) return;
    if (!triggered) triggerPhysics();
  }

  container.addEventListener('click', handleTrigger);
  container.addEventListener('touchend', e => {
    if (e.target.closest('a.project-link')) return;
    lastTouchEnd = Date.now();
    handleTrigger(e);
  }, { passive: true });

  /* ── resize: reset so CSS recalculates proportional positions ── */
  // reset() clears inline styles → CSS percentage positions kick back in,
  // always correct for the current viewport. User can re-click to re-trigger.
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (!triggered) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reset, 150);
  });

  console.log('[physics.js] loaded. Physics flowers:', container.querySelectorAll('[data-physics="true"]').length);

})();
