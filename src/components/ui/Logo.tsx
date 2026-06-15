import { Sparkles } from "lucide-react";

export function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}>
      <div className="p-3.5 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
        <Sparkles className="h-8 w-8 text-amber-400" />
      </div>
      <div className="flex flex-col items-center justify-center font-display text-center mt-2">
        <span className="text-xl md:text-2xl font-bold tracking-wider text-gold-gradient uppercase leading-none">
          Felipe Alvim
        </span>
        <span className="text-[10px] tracking-[0.25em] text-amber-500/80 font-mono uppercase font-medium mt-1">
          nutricionista
        </span>
      </div>
    </div>
  );
}
