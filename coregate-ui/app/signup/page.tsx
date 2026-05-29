'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/brand/site-logo';
import { PageShell } from '@/components/layout/page-shell';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: 'Tạo tài khoản (demo)',
      description: 'Chế độ demo: bạn có thể tiếp tục mua sản phẩm.',
    });
    router.push('/browse');
  };

  return (
    <PageShell showFooter={false} centered>
      <div className="w-full max-w-md ts-card p-8 space-y-6">
        <div className="space-y-2 text-center">
          <SiteLogo variant="full" linked={false} className="mx-auto max-w-[200px]" />
          <h1 className="font-display text-2xl font-semibold text-white">Đăng ký</h1>
          <p className="text-sm text-muted-foreground">Bắt đầu bán hoặc mua source code trên nền tảng.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-muted-foreground">Họ tên</label>
            <input id="name" type="text" className="field-input" placeholder="CoreGate Seller" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
            <input id="email" type="email" className="field-input" placeholder="seller@coregate.local" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-muted-foreground">Mật khẩu</label>
            <input id="password" type="password" className="field-input" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full brand-gradient rounded-xl border-0">
            Tạo tài khoản
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
