'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { BarChart3, ClipboardList, Package, Store } from 'lucide-react';

export default function DashboardPage() {
  const { session, loading } = useRequireAuth();
  const name = session?.user.name || session?.user.username;

  return (
    <PageShell mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <DashboardNav />
      <div className="space-y-8">
        <div>
          <p className="section-label mb-2">Seller</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? 'Quản lý catalog, theo dõi analytics và vận hành marketplace.'
              : name
                ? `Xin chào, ${name}. Quản lý catalog, analytics và marketplace.`
                : 'Quản lý catalog, theo dõi analytics và vận hành marketplace.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/dashboard/orders" className="ts-card p-6 hover:border-primary/25 transition-colors group">
            <ClipboardList className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">Đơn hàng</h2>
            <p className="text-sm text-muted-foreground mt-1">Xem và theo dõi đơn mua</p>
          </Link>
          <Link href="/dashboard/analytics" className="ts-card p-6 hover:border-primary/25 transition-colors group">
            <BarChart3 className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">Phân tích</h2>
            <p className="text-sm text-muted-foreground mt-1">Doanh thu, đơn hàng, lượt tải</p>
          </Link>
          <Link href="/dashboard/catalog" className="ts-card p-6 hover:border-primary/25 transition-colors group">
            <Package className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">Catalog</h2>
            <p className="text-sm text-muted-foreground mt-1">Thêm, sửa sản phẩm hiển thị</p>
          </Link>
          <Link href="/browse" className="ts-card p-6 hover:border-primary/25 transition-colors group">
            <Store className="h-8 w-8 text-primary mb-4" />
            <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">Marketplace</h2>
            <p className="text-sm text-muted-foreground mt-1">Xem trang khách hàng</p>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/orders">
            <Button className="brand-gradient rounded-full border-0">Quản lý đơn hàng</Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" className="btn-outline-dark rounded-full">Mở Analytics</Button>
          </Link>
          <Link href="/dashboard/catalog">
            <Button variant="outline" className="btn-outline-dark rounded-full">Quản lý Catalog</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
