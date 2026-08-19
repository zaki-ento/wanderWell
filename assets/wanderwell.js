// WanderWell Shared Javascript Utilities

export const RM = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Common helper to initialize a pause toggle on scroll/marquee strips for accessibility.
 * @param {HTMLElement} container 
 * @param {HTMLElement} track 
 * @param {boolean} isLight 
 */
export function initMarqueePause(container, track, isLight = false) {
  if (!container || !track) return;
  
  if (!track.id) {
    track.id = 'marquee-track-' + Math.random().toString(36).slice(2, 11);
  }
  
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ticker-pause' + (isLight ? ' ticker-pause--light' : '');
  btn.setAttribute('aria-label', 'Pause scrolling text');
  btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><rect x="1" y="0" width="3" height="10"/><rect x="6" y="0" width="3" height="10"/></svg>';
  
  btn.addEventListener('click', function() {
    const isPaused = track.style.animationPlayState === 'paused';
    track.style.animationPlayState = isPaused ? 'running' : 'paused';
    btn.setAttribute('aria-label', isPaused ? 'Pause scrolling text' : 'Resume scrolling text');
    btn.innerHTML = isPaused
      ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><rect x="1" y="0" width="3" height="10"/><rect x="6" y="0" width="3" height="10"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><polygon points="1,0 9,5 1,10"/></svg>';
  });
  
  container.appendChild(btn);
}
