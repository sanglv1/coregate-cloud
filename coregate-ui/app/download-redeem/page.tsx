'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/lib/config';

interface DownloadItem {
  productId: string;
  fileName: string;
  downloadUrl: string;
}

export default function DownloadRedeemPage() {
  const [code, setCode] = useState('');
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl('/api/downloads/redeem'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || 'Ma khong hop le hoac da het han.');
        setItems([]);
        return;
      }
      const payload = await response.json();
      setItems(payload.items ?? []);
    } catch {
      setError('Khong ket noi duoc den server.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border/40 bg-card/50 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Nhap ma tai source code</h1>
          <p className="text-sm text-muted-foreground">
            Sau khi thanh toan thanh cong, ban se nhan ma qua email.
          </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="VD: CG-ABC123XYZ9"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Dang kiem tra...' : 'Xac nhan ma'}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {items.length > 0 && (
          <div className="rounded-lg border border-border/40 bg-background p-4 space-y-2">
            <p className="text-sm font-medium">Link tai source code:</p>
            {items.map((item) => (
              <a key={item.productId} href={item.downloadUrl} className="block text-sm text-primary underline">
                {item.fileName}
              </a>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
            Quay lai danh sach san pham
          </Link>
        </div>
      </div>
    </div>
  );
}
