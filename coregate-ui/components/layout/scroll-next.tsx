'use client';

import { ChevronDown } from 'lucide-react';

interface ScrollNextProps {
  label?: string;
  targetId?: string;
}

export function ScrollNext({ label = 'TIẾP THEO', targetId }: ScrollNextProps) {
  function handleClick() {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mx-auto py-8"
    >
      <span className="text-[11px] font-semibold tracking-[0.25em] uppercase">{label}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </span>
    </button>
  );
}
