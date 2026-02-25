import { useCallback } from "react";
import confetti from "canvas-confetti";

export const useConfetti = () => {
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#538d4e", "#e4a823", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const fireQuickConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#538d4e", "#e4a823", "#ffffff", "#1a6b3a"],
    });
  }, []);

  return { fireConfetti, fireQuickConfetti };
};
