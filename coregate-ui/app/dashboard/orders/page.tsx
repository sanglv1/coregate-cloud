'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import {
  fetchAdminOrderDetail,
  fetchAdminOrders,
  type OrderDetail,
  type OrderSummary,
} from '@/lib/admin-orders';
import { getAdminCredentials, useRequireRole } from '@/lib/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RefreshCw, X } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ thanh toán',
  completed: 'Hoàn thành',
  failed: 'Thất bại',
};

function statusClass(status: string) {
  if (status === 'completed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (status === 'failed') return 'text-red-400 bg-red-500/10 border-red-500/30';
  return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
}

function formatMoney(amount: number, currency: string) {
  if (currency === 'VND') return `₫${amount.toLocaleString('vi-VN')}`;
  return `${amount.toLocaleString()} ${currency}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const { session, loading } = useRequireRole('admin');
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hasAdminCredentials, setHasAdminCredentials] = useState(false);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    setHasAdminCredentials(getAdminCredentials() !== null);
  }, []);

  const loadOrders = useCallback(async (options?: { silent?: boolean }) => {
    const credentials = getAdminCredentials();
    if (!credentials) {
      setHasAdminCredentials(false);
      setListLoading(false);
      return;
    }
    setHasAdminCredentials(true);
    if (!options?.silent) {
      setListLoading(true);
    }
    try {
      const data = await fetchAdminOrders(credentials);
      setOrders(data);
    } catch (error) {
      toastRef.current({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không tải được đơn hàng',
      });
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || !session) return;
    loadOrders();
  }, [loading, session, loadOrders]);

  async function openDetail(orderId: string) {
    const credentials = getAdminCredentials();
    if (!credentials) return;
    setSelectedId(orderId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await fetchAdminOrderDetail(credentials, orderId);
      setDetail(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không tải chi tiết',
      });
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) {
    return (
      <PageShell showFooter={false} centered>
        <p className="text-muted-foreground">Đang tải...</p>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell centered showFooter={false}>
        <div className="ts-card p-8 text-center space-y-4">
          <p>Chỉ tài khoản admin mới xem được trang này.</p>
          <Link href="/login">
            <Button className="brand-gradient rounded-full border-0">Đăng nhập admin</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const filtered = orders.filter((o) => statusFilter === 'all' || o.status === statusFilter);

  return (
    <PageShell mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <DashboardNav />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">Admin</p>
          <h1 className="font-display text-3xl font-semibold text-white">Quản lý đơn hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách đơn từ database — trạng thái thanh toán và sản phẩm đã mua.
          </p>
        </div>
        <Button
          variant="outline"
          className="btn-outline-dark rounded-full shrink-0"
          onClick={() => loadOrders()}
          disabled={listLoading || !hasAdminCredentials}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', listLoading && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {!hasAdminCredentials && (
        <p className="text-sm text-amber-400/90 mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          Đăng xuất và đăng nhập lại bằng admin để tải danh sách đơn hàng.
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'pending', 'completed', 'failed'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              statusFilter === s
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-white/10 text-muted-foreground hover:border-white/20',
            )}
          >
            {s === 'all' ? 'Tất cả' : STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 ts-card p-0 overflow-hidden">
          {listLoading && orders.length === 0 ? (
            <p className="p-8 text-muted-foreground text-sm">Đang tải đơn hàng...</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-muted-foreground text-sm">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="p-3 font-medium">Mã đơn</th>
                    <th className="p-3 font-medium hidden sm:table-cell">Email</th>
                    <th className="p-3 font-medium">Tổng</th>
                    <th className="p-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className={cn(
                        'border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors',
                        selectedId === order.id && 'bg-primary/10',
                      )}
                      onClick={() => openDetail(order.id)}
                    >
                      <td className="p-3 font-mono text-xs text-foreground/90">
                        {order.id.slice(0, 8)}…
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground truncate max-w-[140px]">
                        {order.customerEmail || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {formatMoney(order.totalAmount, order.currency)}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'inline-block rounded-full border px-2 py-0.5 text-xs',
                            statusClass(order.status),
                          )}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 ts-card p-6 min-h-[280px]">
          {!selectedId ? (
            <p className="text-sm text-muted-foreground">Chọn một đơn để xem chi tiết.</p>
          ) : detailLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải chi tiết...</p>
          ) : detail ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-white">Chi tiết đơn</h2>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-white p-1"
                  onClick={() => {
                    setSelectedId(null);
                    setDetail(null);
                  }}
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Mã đơn</dt>
                  <dd className="font-mono text-xs break-all">{detail.order.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email khách</dt>
                  <dd>{detail.order.customerEmail || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ngày tạo</dt>
                  <dd>{formatDate(detail.order.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Trạng thái đơn</dt>
                  <dd>
                    <span className={cn('inline-block rounded-full border px-2 py-0.5 text-xs', statusClass(detail.order.status))}>
                      {STATUS_LABELS[detail.order.status] ?? detail.order.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Thanh toán</dt>
                  <dd>
                    {detail.paymentStatus
                      ? `${detail.paymentProvider ?? 'gateway'} · ${detail.paymentStatus}${detail.txnRef ? ` · ${detail.txnRef}` : ''}`
                      : 'Chưa có giao dịch'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tổng tiền</dt>
                  <dd className="font-semibold brand-text-gradient">
                    {formatMoney(detail.order.totalAmount, detail.order.currency)}
                  </dd>
                </div>
              </dl>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sản phẩm</p>
                <ul className="space-y-2">
                  {detail.order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.quantity}`}
                      className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs"
                    >
                      <span className="font-mono text-foreground/90">{item.productId}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        × {item.quantity} · {formatMoney(item.unitPrice, detail.order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
