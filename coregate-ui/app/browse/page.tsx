'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/lib/hooks/useCart';
import { CatalogProduct, DEFAULT_PRODUCTS, PRODUCT_CATEGORIES, loadCatalogProducts } from '@/lib/catalog';

const PROJECT_INTRO = [
  'CoreGate Cloud la du an marketplace cho san pham source code cong nghe.',
  'Tap trung vao cac bo source code Java Spring Boot tich hop VNPAY de ban co the trien khai nhanh.',
  'Moi goi deu kem demo flow ro rang, phu hop hoc tap, PoC va tich hop vao du an thuc te.',
];

export default function BrowsePage() {
  const { addItem, count } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<CatalogProduct[]>(DEFAULT_PRODUCTS);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc' | 'downloads'>('latest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setProducts(loadCatalogProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = products.filter((product) => {
      const matchCategory = category === 'all' || product.category === category;
      const matchSearch = normalizedSearch.length === 0
        || product.name.toLowerCase().includes(normalizedSearch)
        || product.description.toLowerCase().includes(normalizedSearch);
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
      title: 'Added to cart',
      description: `${product.name} has been added.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold">CoreGate Cloud</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Link href="/checkout">
              <Button size="sm">
                Cart ({count})
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Danh muc san pham
          </p>
          <h1 className="text-3xl font-bold">Source Code</h1>
          <p className="text-muted-foreground">Chon goi source code phu hop va tiep tuc thanh toan.</p>
        </div>

        <section className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-xl font-semibold mb-3">Gioi thieu du an</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            {PROJECT_INTRO.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo ten source code..."
            className="md:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">Tat ca danh muc</option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'latest' | 'price_asc' | 'price_desc' | 'downloads')}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="latest">Sap xep mac dinh</option>
            <option value="downloads">Luot tai giam dan</option>
            <option value="price_asc">Gia tang dan</option>
            <option value="price_desc">Gia giam dan</option>
          </select>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div>
                <h2 className="font-semibold text-lg leading-snug">{product.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                <p className="text-xs text-muted-foreground mt-2">File: {product.archiveFile}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">₫{product.price.toLocaleString()}</p>
                <span className="text-xs text-muted-foreground">{product.downloads} luot tai</span>
              </div>
              <Button onClick={() => handleAddToCart(product)} className="w-full">
                Add to Cart
              </Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
