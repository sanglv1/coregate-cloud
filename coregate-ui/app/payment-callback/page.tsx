'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/lib/config';
import { CheckCircle, XCircle } from 'lucide-react';

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
            if (result.orderId) {
              setResolvedOrderId(result.orderId);
            }
            if (result.success) {
              if (result.orderId) {
                await loadAccessCode(result.orderId);
              }
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

        // Fallback polling in case IPN updates backend slightly later.
        const maxAttempts = 8;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          const response = await fetch(buildApiUrl(`/api/orders/${idToCheck}`));
          if (!response.ok) {
            continue;
          }

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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {paymentStatus === 'success' ? (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-24 h-24 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Payment Successful!</h1>
              <p className="text-lg text-muted-foreground">
                Your order has been confirmed
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">
                Order ID: <span className="font-mono text-foreground">{resolvedOrderId || orderId}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Ban se nhan ma tai source code qua email va co the nhap ma de tai.
              </p>
              {accessCode && (
                <div className="rounded-lg border border-border/40 bg-card/50 p-3 text-left space-y-2">
                  <p className="text-xs text-muted-foreground">Ma nhan source code:</p>
                  <p className="font-mono text-sm">{accessCode.accessCode}</p>
                  <p className="text-xs text-muted-foreground">Han den: {accessCode.expiresAt}</p>
                </div>
              )}
              {downloads.length > 0 && (
                <div className="rounded-lg border border-border/40 bg-card/50 p-3 text-left space-y-2">
                  <p className="text-xs text-muted-foreground">Hoac nhap ma de tai tai:</p>
                  <Link href="/download-redeem" className="block text-sm text-primary underline">
                    /download-redeem
                  </Link>
                </div>
              )}
              {downloads.length > 0 && (
                <div className="rounded-lg border border-border/40 bg-card/50 p-3 text-left space-y-2">
                  <p className="text-xs text-muted-foreground">Link tai (du phong):</p>
                  {downloads.map((item) => (
                    <a key={item.productId} href={item.downloadUrl} className="block text-sm text-primary underline">
                      {item.fileName}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 pt-8">
              <Link href="/dashboard">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full border-border">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <XCircle className="w-24 h-24 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Payment Failed</h1>
              <p className="text-lg text-muted-foreground">
                There was an issue processing your payment
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">
                Order ID: <span className="font-mono text-foreground">{resolvedOrderId || orderId}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-8">
              <Link href="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Try Again
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full border-border">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-muted-foreground">Loading payment status...</div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
