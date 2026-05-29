'use client';

import Link from 'next/link';
import { Headphones, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export function FloatingSupport() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-primary-foreground shadow-lg shadow-primary/20"
        aria-label="Mở hỗ trợ"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
      <Link
        href="/contact"
        className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-base text-foreground shadow-lg shadow-black/20 backdrop-blur-md hover:border-primary/25 transition-colors"
      >
        <Headphones className="h-4 w-4 text-primary" />
        Chat hỗ trợ
      </Link>
      <a
        href="tel:0972282892"
        className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-base text-foreground shadow-lg shadow-black/20 backdrop-blur-md hover:border-primary/25 transition-colors"
      >
        <MessageCircle className="h-4 w-4 text-violet-400" />
        Zalo / Hotline
      </a>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-900/80 border border-white/10 text-muted-foreground hover:text-foreground"
        aria-label="Đóng"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
