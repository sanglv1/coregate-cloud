'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CatalogProduct, DEFAULT_PRODUCTS, PRODUCT_CATEGORIES, loadCatalogProducts, saveCatalogProducts } from '@/lib/catalog';
import { useRequireRole } from '@/lib/hooks/useAuth';

const EMPTY_FORM: Omit<CatalogProduct, 'downloads'> & { downloads: string } = {
  id: '',
  name: '',
  price: 199000,
  category: PRODUCT_CATEGORIES[0],
  description: '',
  archiveFile: '',
  downloads: '0',
  featured: false,
};

export default function CatalogAdminPage() {
  const { session, loading } = useRequireRole('admin');
  const [products, setProducts] = useState<CatalogProduct[]>(DEFAULT_PRODUCTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setProducts(loadCatalogProducts());
  }, []);

  const title = useMemo(() => (editingId ? 'Cap nhat san pham' : 'Them san pham moi'), [editingId]);

  if (!loading && !session) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Ban khong co quyen truy cap trang nay.</p>
          <Link href="/login"><Button>Dang nhap admin</Button></Link>
        </div>
      </div>
    );
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: CatalogProduct = {
      id: form.id.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      description: form.description.trim(),
      archiveFile: form.archiveFile.trim(),
      downloads: Number(form.downloads),
      featured: Boolean(form.featured),
    };
    if (!payload.id || !payload.name || !payload.description || !payload.archiveFile) {
      return;
    }

    let next: CatalogProduct[];
    if (editingId) {
      next = products.map((item) => (item.id === editingId ? payload : item));
    } else {
      next = [payload, ...products];
    }
    setProducts(next);
    saveCatalogProducts(next);
    resetForm();
  }

  function handleDelete(id: string) {
    const next = products.filter((item) => item.id !== id);
    setProducts(next);
    saveCatalogProducts(next);
    if (editingId === id) {
      resetForm();
    }
  }

  function handleEdit(product: CatalogProduct) {
    setEditingId(product.id);
    setForm({
      ...product,
      downloads: String(product.downloads),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quan ly danh muc source code</h1>
            <p className="text-sm text-muted-foreground">Them, sua, xoa san pham va cap nhat catalog hien thi cho khach mua.</p>
          </div>
          <Link href="/browse"><Button variant="outline">Xem trang san pham</Button></Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="ID (vd: vnpay-pay)" value={form.id} onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))} disabled={Boolean(editingId)} />
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2" placeholder="Ten san pham" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" type="number" placeholder="Gia" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
            <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
              {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" type="number" placeholder="Luot tai" value={form.downloads} onChange={(e) => setForm((prev) => ({ ...prev, downloads: e.target.value }))} />
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-3" placeholder="Mo ta ngan" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <input className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2" placeholder="Ten file ZIP" value={form.archiveFile} onChange={(e) => setForm((prev) => ({ ...prev, archiveFile: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))} />
              Noi bat
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit">{editingId ? 'Luu cap nhat' : 'Them san pham'}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>Huy sua</Button>}
          </div>
        </form>

        <section className="rounded-xl border border-border/50 bg-card p-5">
          <h2 className="text-lg font-semibold mb-4">Danh sach hien tai ({products.length})</h2>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-border/40 rounded-lg p-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.id} · {product.category} · {product.archiveFile}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Sua</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Xoa</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
