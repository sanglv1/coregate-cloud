'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
      // Create order
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
          title: 'Error',
          description: error.error || 'Failed to create order',
        });
        setProcessingPayment(false);
        return;
      }

      const orderData = await orderResponse.json();
      const order = orderData.orders[0];

      // Create VNPAY payment
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
          title: 'Error',
          description: error.error || 'Failed to initiate payment',
        });
        setProcessingPayment(false);
        return;
      }

      const paymentData = await paymentResponse.json();
      
      // Clear cart and redirect to VNPAY
      clearCart();
      window.location.href = paymentData.paymentUrl;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
      setProcessingPayment(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg">CoreGate Cloud</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground">Review your items before payment</p>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/40 rounded-lg">
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <Link href="/browse">
                    <Button className="bg-primary hover:bg-primary/90">Browse Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₫{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">
                          ₫{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg border border-border/40 bg-card/50 sticky top-20 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Email nhan link download</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₫{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₫0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₫0</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold pt-4 border-t border-border/40">
                <span>Total</span>
                <span>₫{total.toLocaleString()}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processingPayment || items.length === 0 || !customerEmail}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {processingPayment ? 'Processing...' : 'Proceed to Payment'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to VNPAY for secure payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
