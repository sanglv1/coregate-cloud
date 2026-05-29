'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { useCart } from '@/lib/hooks/useCart';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { buildApiUrl } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { loading: authLoading } = useRequireAuth();
  const { items, total, removeItem, loading: cartLoading, clearCart } = useCart();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!cartLoading && items.length === 0 && !processingPayment) {
      router.push('/browse');
    }
  }, [items.length, cartLoading, router, processingPayment]);

  async function handleCheckout() {
    setProcessingPayment(true);

    try {
      const orderResponse = await fetch(buildApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerEmail,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error.error || 'Không tạo được đơn hàng',
        });
        setProcessingPayment(false);
        return;
      }

      const orderData = await orderResponse.json();
      const order = orderData.orders[0];

      const paymentResponse = await fetch(buildApiUrl('/api/payments/vnpay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.totalAmount,
          description: `Purchase from CoreGate Cloud - Order ${order.id}`,
          returnUrl: `${window.location.origin}/payment-callback?orderId=${order.id}`,
        }),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error.error || 'Không khởi tạo được thanh toán',
        });
        setProcessingPayment(false);
        return;
      }

      const paymentData = await paymentResponse.json();
      clearCart();
      window.location.href = paymentData.paymentUrl;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
      });
      setProcessingPayment(false);
    }
  }

  if (authLoading || cartLoading) {
    return <PageShell showFooter={false} centered><p className="text-muted-foreground">Đang tải...</p></PageShell>;
  }

  return (
    <PageShell mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <Link href="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Tiếp tục mua sắm
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="section-label mb-2">Thanh toán</p>
            <h1 className="font-display text-3xl font-semibold text-white">Giỏ hàng</h1>
            <p className="text-muted-foreground mt-1">Kiểm tra sản phẩm trước khi thanh toán</p>
          </div>

          {items.length === 0 ? (
            <div className="ts-card text-center py-12">
              <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
              <Link href="/browse">
                <Button className="brand-gradient rounded-full border-0">Xem sản phẩm</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="ts-card p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      SL: {item.quantity} × ₫{item.price.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-semibold brand-text-gradient">
                      ₫{(item.price * item.quantity).toLocaleString('vi-VN')}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="ts-card-highlight p-6 sticky top-24 space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">Tóm tắt đơn</h2>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Email nhận mã tải source</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="ban@email.com"
                className="field-input"
                required
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>₫{total.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span>₫0</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span>Tổng</span>
              <span className="brand-text-gradient">₫{total.toLocaleString('vi-VN')}</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={processingPayment || items.length === 0 || !customerEmail}
              className="w-full brand-gradient rounded-xl border-0"
            >
              {processingPayment ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Bạn sẽ được chuyển sang cổng thanh toán an toàn</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
