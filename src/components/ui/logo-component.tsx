import { useState, useEffect } from "react";

export function Logo({ className = "h-20" }: { className?: string }) {
  const [hasLocalLogo, setHasLocalLogo] = useState(false);

  useEffect(() => {
    // Check if user has uploaded their logo.png to the root or assets folder in VS Code
    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => setHasLocalLogo(true);
    img.onerror = () => {
      // Fallback check in src/assets/logo.png
      const img2 = new Image();
      img2.src = "/src/assets/logo.png";
      img2.onload = () => setHasLocalLogo(true);
    };
  }, []);

  if (hasLocalLogo) {
    return (
      <img
        src="/logo.png"
        alt="Felipe Alvim Nutricionista"
        className={className}
        onError={(e) => {
          // If fallback fails, show vector
          e.currentTarget.src = "/src/assets/logo.png";
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Pure premium custom-styled SVG vector that replicates the gold brand monogram "FA" with luxurious serif typography
  return (
    <div className={`flex items-center justify-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="h-full w-auto drop-shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA73" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#9E7A3F" />
          </linearGradient>
          <filter id="beauty-glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer stylized elegant golden ring */}
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="url(#logo-gold)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="opacity-40 animate-[spin_120s_linear_infinite]"
        />

        {/* High-end decorative gold badge corner sparks */}
        <path
          d="M 60 2 L 60 8 M 60 112 L 60 118 M 2 60 L 8 60 M 112 60 L 118 60"
          stroke="url(#logo-gold)"
          strokeWidth="1.5"
          className="opacity-70"
        />

        {/* Elite stylized FA gold monogram */}
        <g filter="url(#beauty-glow)">
          {/* F curve sweeping flourish */}
          <path
            d="M 42 35 C 48 35, 52 38, 55 43 M 42 35 L 42 85 C 42 88, 38 92, 32 94 M 42 58 L 52 58"
            stroke="url(#logo-gold)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Letter A elegant overlapping sweep */}
          <path
            d="M 72 85 C 75 75, 58 45, 54 35 C 50 28, 48 24, 45 24 M 48 64 C 55 64, 66 64, 76 64 M 78 85 L 72 85"
            stroke="url(#logo-gold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Brand Text Right Side */}
      <div className="flex flex-col items-start justify-center font-display text-left">
        <span className="text-xl md:text-2xl font-bold tracking-wider text-gold-gradient uppercase leading-none">
          Felipe Alvim
        </span>
        <span className="text-[10px] md:text-xs tracking-[0.25em] text-gold-soft font-mono uppercase font-medium mt-1">
          nutricionista
        </span>
      </div>
    </div>
  );
}
