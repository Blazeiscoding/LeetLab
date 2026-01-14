import { useCallback } from "react";
import confetti from "canvas-confetti";

/**
 * Hook to trigger confetti celebration animation
 * Used when user successfully solves a problem
 */
export const useConfetti = () => {
  const triggerConfetti = useCallback((options = {}) => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#22c55e", "#4ade80", "#a3e635", "#fbbf24"],
    };

    confetti({
      ...defaults,
      ...options,
    });
  }, []);

  // Big celebration for solving a problem
  const celebrate = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from the left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#10b981", "#22c55e", "#4ade80"],
      });

      // Confetti from the right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#f59e0b", "#fbbf24", "#fcd34d"],
      });
    }, 250);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Quick burst for smaller achievements
  const burst = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.5 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6"],
    });
  }, []);

  // Fire canons from both sides
  const fireCanons = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * particleRatio),
        ...opts,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2 },
    });
    fire(0.2, {
      spread: 60,
      origin: { x: 0.8 },
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.5 },
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5 },
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5 },
    });
  }, []);

  return {
    triggerConfetti,
    celebrate,
    burst,
    fireCanons,
  };
};
