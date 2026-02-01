/**
 * Celebration Effects Manager
 * Handles confetti and celebration animations when levels are completed
 */

export class CelebrationManager {
  /**
   * Triggers a confetti celebration effect
   * @param {string} intensity - 'small', 'medium', or 'large'
   */
  static triggerConfetti(intensity = 'medium') {
    if (typeof confetti === 'undefined') {
      console.warn('Confetti library not loaded');
      return;
    }

    switch (intensity) {
      case 'small':
        this.smallCelebration();
        break;
      case 'large':
        this.largeCelebration();
        break;
      case 'medium':
      default:
        this.mediumCelebration();
        break;
    }
  }

  /**
   * Small celebration - single burst
   */
  static smallCelebration() {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00cec9', '#81ecec', '#74b9ff', '#a29bfe', '#ffeaa7'],
    });
  }

  /**
   * Medium celebration - double burst
   */
  static mediumCelebration() {
    const count = 100;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#00cec9', '#81ecec', '#74b9ff', '#a29bfe', '#ffeaa7', '#00b894'],
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  /**
   * Large celebration - continuous fireworks
   */
  static largeCelebration() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 2000,
      colors: ['#00cec9', '#81ecec', '#74b9ff', '#a29bfe', '#ffeaa7', '#00b894', '#fdcb6e'],
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Burst from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Burst from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  /**
   * Screen shake effect
   */
  static screenShake() {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen && !gameScreen.classList.contains('hidden')) {
      gameScreen.style.animation = 'screenShake 0.5s ease-in-out';
      setTimeout(() => {
        gameScreen.style.animation = '';
      }, 500);
    }
  }

  /**
   * Star burst effect around success message
   */
  static starBurst() {
    const successMsg = document.getElementById('success-msg');
    if (!successMsg) return;

    // Create star burst container
    const container = document.createElement('div');
    container.className = 'star-burst-container';
    container.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 100;
    `;

    // Create multiple stars
    for (let i = 0; i < 8; i++) {
      const star = document.createElement('div');
      star.textContent = '⭐';
      star.style.cssText = `
        position: absolute;
        font-size: 24px;
        animation: starBurst 1s ease-out forwards;
        --angle: ${i * 45}deg;
      `;
      container.appendChild(star);
    }

    successMsg.style.position = 'relative';
    successMsg.appendChild(container);

    // Remove after animation
    setTimeout(() => {
      container.remove();
    }, 1000);
  }

  /**
   * Full celebration combo - use for level completion
   */
  static levelComplete() {
    this.triggerConfetti('medium');
    this.screenShake();
    setTimeout(() => this.starBurst(), 200);
  }

  /**
   * Epic celebration - use for milestone levels (every 10th, 25th, 50th, 100th)
   */
  static milestoneComplete() {
    this.triggerConfetti('large');
    this.screenShake();
    setTimeout(() => this.starBurst(), 200);
  }
}
