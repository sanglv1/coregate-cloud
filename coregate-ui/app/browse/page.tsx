'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/lib/hooks/useCart';
import {
  CatalogProduct,
  DEFAULT_PRODUCTS,
  PRODUCT_CATEGORIES,
  loadCatalogProducts,
  productDetailPath,
} from '@/lib/catalog';
import { ShoppingCart, Sparkles } from 'lucide-react';

const PROJECT_INTRO = [
  'CoreGate Cloud là marketplace source code đa ngành công nghệ.',
  'Java, PHP, .NET, Node.js, Python — API, admin, e-commerce, SaaS và nhiều lĩnh vực khác.',
  'Mỗi gói kèm README, hướng dẫn cài đặt và file ZIP giao tự động sau thanh toán.',
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? 'all';
  const { addItem, count } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<CatalogProduct[]>(DEFAULT_PRODUCTS);
  const [category, setCategory] = useState(
    PRODUCT_CATEGORIES.includes(initialCategory) ? initialCategory : 'all',
  );
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc' | 'downloads'>('latest');
  const [search, setSearch] = useState(initialQ);

  useEffect(() => {
    setProducts(loadCatalogProducts());
  }, []);

  useEffect(() => {
    setSearch(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setCategory(PRODUCT_CATEGORIES.includes(initialCategory) ? initialCategory : 'all');
  }, [initialCategory]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = products.filter((product) => {
      const matchCategory = category === 'all' || product.category === category;
      const matchSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.id.toLowerCase().includes(normalizedSearch);
      return matchCategory && matchSearch;
    });

    const sorted = [...base];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'downloads') sorted.sort((a, b) => b.downloads - a.downloads);
    return sorted;
  }, [category, products, search, sortBy]);

  const handleAddToCart = (product: CatalogProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    toast({
      title: 'Đã thêm vào giỏ',
      description: `${product.name}`,
    });
  };

  return (
    <PageShell mainClassName="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className="section-label inline-flex items-center gap-2 justify-center">
            <Sparkles className="h-3.5 w-3.5" />
            Danh mục sản phẩm
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Danh Mục <span className="brand-text-gradient">Source Code</span>
          </h1>
          <p className="text-muted-foreground">Lọc theo ngôn ngữ, lĩnh vực — mua và tải source ngay sau thanh toán.</p>
          <Link href="/checkout">
            <Button className="gap-2 brand-gradient rounded-full border-0">
              <ShoppingCart className="h-4 w-4" />
              Giỏ hàng ({count})
            </Button>
          </Link>
        </div>

        <section className="glass-card p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold mb-4">Giới thiệu dự án</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            {PROJECT_INTRO.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <section className="glass-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, mô tả, ID..."
            className="md:col-span-2 rounded-xl border border-white/15 bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-white/15 bg-background/80 px-4 py-2.5 text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as 'latest' | 'price_asc' | 'price_desc' | 'downloads')
            }
            className="rounded-xl border border-white/15 bg-background/80 px-4 py-2.5 text-sm"
          >
            <option value="latest">Sắp xếp mặc định</option>
            <option value="downloads">Lượt tải giảm dần</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="glass-card p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors group"
            >
              {product.featured && (
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Nổi bật</span>
              )}
              <div className="flex-1 space-y-2">
                <h2 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">
                  {product.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                <p className="text-xs text-muted-foreground/80 font-mono">📦 {product.archiveFile}</p>
              </div>
              <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-2xl font-bold brand-text-gradient">₫{product.price.toLocaleString('vi-VN')}</p>
                  <span className="text-xs text-muted-foreground">{product.downloads} lượt tải</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={productDetailPath(product.id)} className="flex-1">
                  <Button variant="outline" className="w-full border-white/15" size="sm">
                    Chi tiết
                  </Button>
                </Link>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 brand-gradient rounded-xl border-0"
                  size="sm"
                >
                  Thêm giỏ
                </Button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Không tìm thấy sản phẩm phù hợp.</p>
        )}
    </PageShell>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Đang tải...</div>}
    >
      <BrowseContent />
    </Suspense>
  );
}
