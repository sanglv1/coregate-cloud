'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/brand/site-logo';
import { PageShell } from '@/components/layout/page-shell';
import { useToast } from '@/hooks/use-toast';
import { saveAdminCredentials, saveSession } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Đăng nhập thất bại',
          description: 'Sai tên đăng nhập hoặc mật khẩu.',
        });
        return;
      }

      const user = await response.json();
      saveSession({
        user: {
          id: user.id,
          username: user.username,
          name: user.username,
          role: user.role,
        },
      });
      if (user.role === 'admin') {
        saveAdminCredentials({ username, password });
      }

      toast({ title: 'Đăng nhập thành công', description: `Xin chào ${user.username}.` });
      router.push('/dashboard');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Lỗi kết nối',
        description: 'Không thể kết nối dịch vụ xác thực.',
      });
    }
  };

  return (
    <PageShell showFooter={false} centered>
      <div className="w-full max-w-md ts-card p-8 space-y-6">
        <div className="space-y-2 text-center">
          <SiteLogo variant="full" linked={false} className="mx-auto max-w-[200px]" />
          <h1 className="font-display text-2xl font-semibold text-white">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">Dùng tài khoản admin để truy cập dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm text-muted-foreground">Tên đăng nhập</label>
            <input id="username" name="username" type="text" className="field-input" placeholder="sanglv" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-muted-foreground">Mật khẩu</label>
            <input id="password" name="password" type="password" className="field-input" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full brand-gradient rounded-xl border-0">
            Đăng nhập
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
