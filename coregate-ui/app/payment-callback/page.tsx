'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { buildApiUrl } from '@/lib/config';
import { CheckCircle, Copy, XCircle } from 'lucide-react';

interface DownloadItem {
  productId: string;
  fileName: string;
  downloadUrl: string;
}

interface AccessCodePayload {
  orderId: string;
  accessCode: string;
  expiresAt: string;
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const callbackQuery = searchParams.toString();
  const orderId = searchParams.get('orderId');
  const hasVnpReturn = searchParams.has('vnp_TxnRef') || searchParams.has('vnp_ResponseCode');
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderId);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [accessCode, setAccessCode] = useState<AccessCodePayload | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>(
    orderId || hasVnpReturn ? 'loading' : 'failed'
  );

  useEffect(() => {
    async function verifyPayment() {
      try {
        if (hasVnpReturn) {
          const verifyResponse = await fetch(buildApiUrl(`/api/payments/vnpay/return-verify?${callbackQuery}`));
          if (verifyResponse.ok) {
            const result = await verifyResponse.json();
            if (result.orderId) setResolvedOrderId(result.orderId);
            if (result.success) {
              if (result.orderId) await loadAccessCode(result.orderId);
              setPaymentStatus('success');
              return;
            }
          }
        }

        const idToCheck = resolvedOrderId || orderId;
        if (!idToCheck) {
          setPaymentStatus('failed');
          return;
        }

        const maxAttempts = 8;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 2000));
          const response = await fetch(buildApiUrl(`/api/orders/${idToCheck}`));
          if (!response.ok) continue;
          const order = await response.json();
          if (order.status === 'completed') {
            await loadAccessCode(idToCheck);
            setPaymentStatus('success');
            return;
          }
          if (order.status === 'failed') {
            setPaymentStatus('failed');
            return;
          }
        }
        setPaymentStatus('failed');
      } catch (error) {
        console.error('Failed to verify payment:', error);
        setPaymentStatus('failed');
      }
    }
    verifyPayment();
  }, [callbackQuery, hasVnpReturn, orderId, resolvedOrderId]);

  async function loadDownloads(currentOrderId: string) {
    const response = await fetch(buildApiUrl(`/api/downloads?orderId=${currentOrderId}`));
    if (!response.ok) return;
    const payload = await response.json();
    setDownloads(payload.items ?? []);
  }

  async function loadAccessCode(currentOrderId: string) {
    const response = await fetch(buildApiUrl(`/api/downloads/access-code?orderId=${currentOrderId}`));
    if (!response.ok) return;
    const payload = await response.json();
    setAccessCode(payload);
    await loadDownloads(currentOrderId);
  }

  if (paymentStatus === 'loading') {
    return (
      <PageShell showFooter={false} centered>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Đang xác minh thanh toán...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell centered mainClassName="px-4 py-12">
      <div className="w-full max-w-lg text-center space-y-8">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold text-white">Thanh toán thành công</h1>
              <p className="text-muted-foreground">Đơn hàng của bạn đã được xác nhận</p>
            </div>
            <div className="ts-card p-5 text-left space-y-4 text-sm">
              <p className="text-muted-foreground">
                Mã đơn: <span className="font-mono text-white">{resolvedOrderId || orderId}</span>
              </p>
              {accessCode && (
                <div className="ts-card-highlight p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Mã nhận source code</p>
                  <p className="font-mono text-lg text-primary">{accessCode.accessCode}</p>
                  <p className="text-xs text-muted-foreground">Hết hạn: {new Date(accessCode.expiresAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
              {downloads.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Link tải trực tiếp:</p>
                  {downloads.map((item) => (
                    <a
                      key={item.productId}
                      href={item.downloadUrl}
                      className="block rounded-lg border border-border bg-card/60 px-4 py-2.5 text-primary/90 hover:border-primary/25"
                    >
                      {item.fileName}
                    </a>
                  ))}
                </div>
              )}
              <Link href="/download-redeem" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Copy className="h-3.5 w-3.5" />
                Hoặc nhập mã tại trang redeem
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/browse">
                <Button className="w-full brand-gradient rounded-xl border-0">Tiếp tục mua sắm</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full btn-outline-dark rounded-xl">Dashboard</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto" />
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold text-white">Thanh toán thất bại</h1>
              <p className="text-muted-foreground">Không xác nhận được giao dịch. Vui lòng thử lại.</p>
            </div>
            {resolvedOrderId || orderId ? (
              <p className="text-sm text-muted-foreground font-mono">{resolvedOrderId || orderId}</p>
            ) : null}
            <div className="flex flex-col gap-3">
              <Link href="/checkout">
                <Button className="w-full brand-gradient rounded-xl border-0">Thử lại</Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full btn-outline-dark rounded-xl">Về cửa hàng</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PageShell showFooter={false} centered><p className="text-muted-foreground">Đang tải...</p></PageShell>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
