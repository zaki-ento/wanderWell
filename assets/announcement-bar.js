import { Component } from '@theme/component';

/**
 * Announcement banner custom element that allows fading between content.
 * Based on the Slideshow component.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} slideshowContainer
 * @property {HTMLElement[]} [slides]
 * @property {HTMLButtonElement} [previous]
 * @property {HTMLButtonElement} [next]
 *
 * @extends {Component<Refs>}
 */
export class AnnouncementBar extends Component {
  #current = 0;

  /**
   * The interval ID for automatic playback.
   * @type {number|undefined}
   */
  #interval = undefined;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('mouseenter', this.suspend);
    this.addEventListener('mouseleave', this.resume);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange);

    this.play();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this.suspend();
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
  }

  next() {
    this.current += 1;
  }

  previous() {
    this.current -= 1;
  }

  /**
   * Starts automatic slide playback.
   * @param {number} [interval] - The time interval in seconds between slides.
   */
  play(interval = this.autoplayInterval) {
    if (!this.autoplay) return;

    this.suspend();
    this.paused = false;

    this.#interval = setInterval(() => {
      // Only pause on hover if device actually supports hover (avoids sticky hover on touchscreens)
      const isHovered = window.matchMedia?.('(hover: hover)').matches && this.matches(':hover');
      if (isHovered || document.hidden) return;

      this.next();
    }, interval);
  }

  /**
   * Pauses automatic slide playback (user-initiated pause).
   */
  pause() {
    this.paused = true;
    this.suspend();
  }

  get paused() {
    return this.hasAttribute('paused');
  }

  set paused(paused) {
    this.toggleAttribute('paused', paused);
  }

  /**
   * Suspends automatic slide playback (temporary suspension without toggling paused state).
   */
  suspend = () => {
    if (this.#interval !== undefined) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  };

  /**
   * Resumes automatic slide playback if autoplay is enabled and not manually paused.
   */
  resume = () => {
    if (!this.autoplay || this.paused) return;

    this.play();
  };

  get autoplay() {
    return Boolean(this.autoplayInterval);
  }

  get autoplayInterval() {
    const interval = this.getAttribute('autoplay');
    const value = parseInt(`${interval}`, 10);

    if (Number.isNaN(value)) return undefined;

    return value * 1000;
  }

  get current() {
    return this.#current;
  }

  set current(current) {
    this.#current = current;

    let relativeIndex = current % (this.refs.slides ?? []).length;
    if (relativeIndex < 0) {
      relativeIndex += (this.refs.slides ?? []).length;
    }

    this.refs.slides?.forEach((slide, index) => {
      const isHidden = index !== relativeIndex;
      slide.setAttribute('aria-hidden', `${isHidden}`);
      slide.toggleAttribute('inert', isHidden);
    });
  }

  /**
   * Temporarily suspend slideshow when tab is hidden, and resume when visible again.
   */
  #handleVisibilityChange = () => {
    if (document.hidden) {
      this.suspend();
    } else if (!this.paused && this.autoplay) {
      this.play();
    }
  };
}

if (!customElements.get('announcement-bar-component')) {
  customElements.define('announcement-bar-component', AnnouncementBar);
}
