'use client';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Starfield } from '@/components/layout/starfield';
import { FloatingSupport } from '@/components/layout/floating-support';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showFloatingSupport?: boolean;
  showStarfield?: boolean;
  centered?: boolean;
}

export function PageShell({
  children,
  className,
  mainClassName,
  showHeader = true,
  showFooter = true,
  showFloatingSupport = true,
  showStarfield = true,
  centered = false,
}: PageShellProps) {
  return (
    <div className={cn('relative min-h-screen bg-background text-foreground', className)}>
      {showStarfield && <Starfield />}
      <div className="relative z-10 flex min-h-screen flex-col">
        {showHeader && <SiteHeader />}
        <main
          className={cn(
            'flex-1',
            centered && 'flex items-center justify-center px-4 py-10',
            mainClassName
          )}
        >
          {children}
        </main>
        {showFooter && <SiteFooter />}
      </div>
      {showFloatingSupport && <FloatingSupport />}
    </div>
  );
}

export function PageLoading({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <PageShell showFooter={false} showFloatingSupport={false} centered>
      <p className="text-muted-foreground">{label}</p>
    </PageShell>
  );
}
