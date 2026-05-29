'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { ProductMedia } from '@/components/product/product-media';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/lib/hooks/useCart';
import {
  findCatalogProduct,
  loadCatalogProducts,
} from '@/lib/catalog';
import { ArrowLeft, Package, ShoppingCart } from 'lucide-react';

function renderIntroParagraphs(intro: string) {
  return intro
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const productId = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';

  const [product, setProduct] = useState<ReturnType<typeof findCatalogProduct>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const catalog = loadCatalogProducts();
    const found = findCatalogProduct(catalog, productId);
    setProduct(found ?? null);
    setReady(true);
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    toast({
      title: 'Đã thêm vào giỏ',
      description: product.name,
    });
  }

  if (!ready) {
    return (
      <PageShell centered>
        <p className="text-muted-foreground">Đang tải...</p>
      </PageShell>
    );
  }

  if (!product) {
    return (
      <PageShell centered mainClassName="px-4 py-16">
        <div className="ts-card p-8 max-w-lg w-full text-center space-y-4">
          <h1 className="font-display text-2xl font-semibold text-white">Không tìm thấy sản phẩm</h1>
          <p className="text-base text-muted-foreground">
            ID <span className="font-mono text-foreground/80">{productId || '—'}</span> không có trong
            catalog. Thử{' '}
            <Link href="/dashboard/catalog" className="text-primary hover:underline">
              quản lý catalog
            </Link>{' '}
            hoặc về danh mục.
          </p>
          <Link href="/browse">
            <Button className="brand-gradient rounded-full border-0">Về danh mục</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const introParagraphs = product.intro ? renderIntroParagraphs(product.intro) : [];
  const hasMedia = Boolean(product.youtubeUrl?.trim()) || (product.imageUrls?.length ?? 0) > 0;

  return (
    <PageShell mainClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full">
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh mục source code
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-3">
            {product.featured && (
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Nổi bật</span>
            )}
            <p className="text-base text-muted-foreground">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{product.name}</h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{product.description}</p>
          </header>

          {hasMedia && (
            <ProductMedia
              youtubeUrl={product.youtubeUrl}
              imageUrls={product.imageUrls}
              productName={product.name}
            />
          )}

          {introParagraphs.length > 0 && (
            <section className="ts-card p-6 md:p-8 space-y-4">
              <h2 className="font-display text-xl md:text-2xl font-semibold text-white">Giới thiệu sản phẩm</h2>
              <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {!hasMedia && introParagraphs.length === 0 && (
            <p className="text-base text-muted-foreground rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-6 text-center">
              Chưa có video/ảnh demo hoặc giới thiệu chi tiết. Admin có thể bổ sung tại Dashboard → Catalog.
            </p>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="ts-card p-6 md:p-8 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-1">
              <p className="text-base text-muted-foreground">Giá</p>
              <p className="text-3xl font-bold brand-text-gradient">
                ₫{product.price.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="space-y-1 text-base">
              <p className="text-muted-foreground">Lượt tải (ước tính)</p>
              <p className="font-semibold text-white">{product.downloads}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2 text-base">
              <p className="text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4 shrink-0" />
                File giao hàng
              </p>
              <p className="font-mono text-sm text-foreground/90 break-all">{product.archiveFile}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="brand-gradient rounded-full border-0 w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                variant="outline"
                className="btn-outline-dark rounded-full w-full"
                onClick={() => router.push('/checkout')}
              >
                Đi tới thanh toán
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
