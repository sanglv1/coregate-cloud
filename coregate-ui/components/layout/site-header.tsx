'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/brand/site-logo';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { clearSession, useRequireAuth } from '@/lib/hooks/useAuth';
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/browse', vi: 'Sản Phẩm', en: 'Products' },
  { href: '/buyer-guide', vi: 'Hướng Dẫn', en: 'Guides' },
  { href: '/blog', vi: 'Blog', en: 'Blog' },
  { href: '/pricing', vi: 'Bảng Giá', en: 'Pricing' },
  { href: '/contact', vi: 'Liên Hệ', en: 'Contact' },
];

export function SiteHeader() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { session, loading } = useRequireAuth();
  const isVi = language === 'vi';
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = session?.user.name || session?.user.username;

  async function handleLogout() {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {
      // ignore network errors on sign-out
    }
    clearSession();
    setMobileOpen(false);
    router.push('/');
  }

  function AuthActions({ className = '' }: { className?: string }) {
    if (loading) {
      return (
        <div className={`h-9 w-24 rounded-full bg-white/5 animate-pulse ${className}`} aria-hidden />
      );
    }

    if (session && displayName) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-base text-gray-200 hover:text-white hover:border-white/20 transition-colors max-w-[180px]"
            title={displayName}
          >
            <User className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{displayName}</span>
          </Link>
          <Link href="/dashboard" className="sm:hidden">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/5 px-2">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{isVi ? 'Đăng xuất' : 'Sign out'}</span>
          </Button>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
            {isVi ? 'Đăng nhập' : 'Sign In'}
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            size="sm"
            className="brand-gradient rounded-full px-5 border-0 shadow-lg shadow-primary/15 hover:opacity-90"
          >
            {isVi ? 'Đăng ký' : 'Register'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] h-16 items-center gap-4">
          <SiteLogo className="justify-self-start" priority />

          <nav className="hidden lg:flex items-center justify-center gap-1 justify-self-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-0.5 px-3 py-2 text-base text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {isVi ? link.vi : link.en}
                {(link.href === '/browse' || link.href === '/buyer-guide') && (
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 justify-self-end">
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-[11px] mr-1">
              <button
                type="button"
                className={`px-2 py-1 ${isVi ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                onClick={() => setLanguage('vi')}
              >
                VI
              </button>
              <button
                type="button"
                className={`px-2 py-1 ${!isVi ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
            <AuthActions />
          </div>

          <button
            type="button"
            className="lg:hidden justify-self-end p-2 rounded-lg border border-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-4 space-y-1 border-t border-white/10 pt-3">
            {session && displayName && (
              <div className="px-3 py-2 mb-2 flex items-center gap-2 text-base text-primary border-b border-border pb-3">
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">{displayName}</span>
              </div>
            )}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-base text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {isVi ? link.vi : link.en}
              </Link>
            ))}
            {session && (
              <Link
                href="/dashboard"
                className="block px-3 py-2.5 text-base text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-3 border-t border-white/10">
              <AuthActions className="flex-col w-full [&_a]:w-full [&_button]:w-full" />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
