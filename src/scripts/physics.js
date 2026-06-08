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
  let triggered     = false;
  let rafId         = null;
  let bodies        = [];
  let staggerTimers = [];
  let draggedBody   = null;
  let dragOffset    = { x: 0, y: 0 };
  let lastPointerPos = { x: 0, y: 0 };
  let pointerVel    = { x: 0, y: 0 };

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
  function triggerPhysics(instant = false) {
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
      const initBody = () => {
        if (bodies.some(b => b.el === el)) return;

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

        if (!rafId) {
          rafId = requestAnimationFrame(step);
        }
      };

      if (instant) {
        initBody();
      } else {
        const timer = setTimeout(initBody, i * STAGGER_MS);
        staggerTimers.push(timer);
      }
    });
  }

  /* ── simulation step ─────────────────────────────────────── */
  function step() {
    let anyActive = false;

    bodies.forEach(b => {
      if (b === draggedBody) {
        anyActive = true;
        return;
      }

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
  function reset() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    staggerTimers.forEach(clearTimeout);
    staggerTimers = [];
    draggedBody = null;

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

  // Prevent default browser dragging on child images
  container.querySelectorAll('[data-physics="true"] img').forEach(img => {
    img.setAttribute('draggable', 'false');
  });

  function handlePointerDown(e) {
    if (e.target.closest('a.project-link')) return;
    if (prefersReduced.matches) return;

    if (e.type === 'touchstart') {
      lastTouchEnd = Date.now();
    }

    const flowerEl = e.target.closest('[data-physics="true"]');
    if (!flowerEl) {
      if (!triggered) triggerPhysics(false);
      return;
    }

    e.preventDefault();

    if (!triggered) {
      triggerPhysics(true);
    }

    draggedBody = bodies.find(b => b.el === flowerEl);
    if (!draggedBody) return;

    const containerRect = container.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);

    const pointerX = clientX - containerRect.left;
    const pointerY = clientY - containerRect.top;

    dragOffset.x = pointerX - draggedBody.x;
    dragOffset.y = pointerY - draggedBody.y;

    draggedBody.settled = false;
    draggedBody.el.classList.remove('is-landed');
    draggedBody.el.classList.add('is-falling');

    lastPointerPos.x = pointerX;
    lastPointerPos.y = pointerY;
    pointerVel.x = 0;
    pointerVel.y = 0;
  }

  function handlePointerMove(e) {
    if (!draggedBody) return;

    const containerRect = container.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    const pointerX = clientX - containerRect.left;
    const pointerY = clientY - containerRect.top;

    draggedBody.x = pointerX - dragOffset.x;
    draggedBody.y = pointerY - dragOffset.y;

    const maxW = container.offsetWidth - draggedBody.w;
    const maxH = draggedBody.floorY - draggedBody.h;

    if (draggedBody.x < 0) draggedBody.x = 0;
    if (draggedBody.x > maxW) draggedBody.x = maxW;
    if (draggedBody.y < 0) draggedBody.y = 0;
    if (draggedBody.y > maxH) draggedBody.y = maxH;

    pointerVel.x = pointerX - lastPointerPos.x;
    pointerVel.y = pointerY - lastPointerPos.y;

    lastPointerPos.x = pointerX;
    lastPointerPos.y = pointerY;

    draggedBody.angle += pointerVel.x * 0.45;

    draggedBody.el.style.left = draggedBody.x + 'px';
    draggedBody.el.style.top = draggedBody.y + 'px';
    draggedBody.el.style.transform = `rotate(${draggedBody.angle}deg)`;

    if (!rafId) {
      rafId = requestAnimationFrame(step);
    }
  }

  function handlePointerUp() {
    if (!draggedBody) return;

    const MAX_THROW_SPEED = 18;
    draggedBody.vx = Math.min(Math.max(pointerVel.x, -MAX_THROW_SPEED), MAX_THROW_SPEED);
    draggedBody.vy = Math.min(Math.max(pointerVel.y, -MAX_THROW_SPEED), MAX_THROW_SPEED);
    draggedBody.spin = Math.min(Math.max(pointerVel.x * 0.35, -5), 5);

    draggedBody = null;
  }

  container.addEventListener('mousedown', handlePointerDown);
  container.addEventListener('touchstart', handlePointerDown, { passive: false });

  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('touchmove', handlePointerMove, { passive: false });
  window.addEventListener('mouseup', handlePointerUp);
  window.addEventListener('touchend', handlePointerUp);
  window.addEventListener('touchcancel', handlePointerUp);

  /* ── resize: reset so CSS recalculates proportional positions ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (!triggered) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reset, 150);
  });

  console.log('[physics.js] loaded. Drag & Throw active. Physics flowers:', container.querySelectorAll('[data-physics="true"]').length);

})();
