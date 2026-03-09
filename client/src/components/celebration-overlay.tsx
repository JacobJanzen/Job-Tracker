import { useEffect, useState } from "react";

const CONFETTI_COLORS = [
  "#10b981", "#34d399", "#6ee7b7",
  "#eab308", "#facc15", "#fde047",
  "#f97316", "#fb923c", "#a855f7",
  "#ec4899", "#3b82f6",
];

const CONFETTI_COUNT = 60;

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  isCircle: boolean;
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    isCircle: Math.random() > 0.5,
  }));
}

export function CelebrationOverlay({ onComplete }: { onComplete: () => void }) {
  const [confetti] = useState(() => generateConfetti());

  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      style={{ animation: "celebration-wash 5s ease-in-out forwards" }}
      data-testid="celebration-overlay"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(234, 179, 8, 0.1) 40%, rgba(16, 185, 129, 0.05) 70%, transparent 100%)",
        }}
      />
      {confetti.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: "absolute",
            left: `${piece.left}%`,
            top: "-20px",
            width: `${piece.size}px`,
            height: piece.isCircle ? `${piece.size}px` : `${piece.size * 1.5}px`,
            backgroundColor: piece.color,
            borderRadius: piece.isCircle ? "50%" : "2px",
            animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
