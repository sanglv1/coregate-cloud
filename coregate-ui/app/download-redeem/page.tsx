'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { buildApiUrl } from '@/lib/config';
import { Download } from 'lucide-react';

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
        setError(payload.error || 'Mã không hợp lệ hoặc đã hết hạn.');
        setItems([]);
        return;
      }
      const payload = await response.json();
      setItems(payload.items ?? []);
    } catch {
      setError('Không kết nối được đến server.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell centered mainClassName="px-4 py-12">
      <div className="w-full max-w-xl ts-card p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Nhập mã tải source code</h1>
          <p className="text-sm text-muted-foreground">
            Sau khi thanh toán thành công, bạn nhận mã dạng <span className="font-mono text-primary">CG-...</span> qua email hoặc trang kết quả thanh toán.
          </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="VD: CG-ABC123XYZ9"
            className="field-input font-mono text-center"
            required
          />
          <Button type="submit" className="w-full brand-gradient rounded-xl border-0" disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Xác nhận mã'}
          </Button>
        </form>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {items.length > 0 && (
          <div className="ts-card-highlight p-4 space-y-3">
            <p className="text-sm font-medium text-white">Link tải source code:</p>
            {items.map((item) => (
              <a
                key={item.productId}
                href={item.downloadUrl}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-4 py-3 text-sm text-primary/90 hover:border-primary/25 transition-colors"
              >
                <span>{item.fileName}</span>
                <Download className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
