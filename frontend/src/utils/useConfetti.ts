import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  startVelocity?: number;
  ticks?: number;
  zIndex?: number;
}

export const useConfetti = () => {
  const triggerConfetti = useCallback((options: ConfettiOptions = {}) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#22c55e', '#4ade80', '#a3e635', '#fbbf24'],
    };

    confetti({
      ...defaults,
      ...options,
    });
  }, []);

  const celebrate = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#22c55e', '#4ade80'],
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const burst = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.5 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
    });
  }, []);

  const fireCanons = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: ConfettiOptions) {
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
      origin: { x: 0.5 },
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
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
