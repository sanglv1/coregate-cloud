'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/page-shell';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { uploadProductArchive, fetchArchiveStatus, type ArchiveStatus } from '@/lib/admin-upload';
import {
  CatalogProduct,
  DEFAULT_PRODUCTS,
  PRODUCT_CATEGORIES,
  loadCatalogProducts,
  productDetailPath,
  saveCatalogProducts,
} from '@/lib/catalog';
import { formatImageUrlLines, parseImageUrlLines } from '@/lib/catalog-media';
import { extractYoutubeVideoId } from '@/lib/youtube';
import { getAdminCredentials, useRequireRole } from '@/lib/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Upload } from 'lucide-react';

type CatalogFormState = Omit<CatalogProduct, 'downloads' | 'imageUrls'> & {
  downloads: string;
  imageUrlsText: string;
};

const EMPTY_FORM: CatalogFormState = {
  id: '',
  name: '',
  price: 199000,
  category: PRODUCT_CATEGORIES[0],
  description: '',
  intro: '',
  youtubeUrl: '',
  imageUrlsText: '',
  archiveFile: '',
  downloads: '0',
  featured: false,
};

const inputClass = 'field-input';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CatalogAdminPage() {
  const { session, loading } = useRequireRole('admin');
  const { toast } = useToast();
  const [products, setProducts] = useState<CatalogProduct[]>(DEFAULT_PRODUCTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus | null>(null);

  useEffect(() => {
    setProducts(loadCatalogProducts());
  }, []);

  const title = useMemo(() => (editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'), [editingId]);

  useEffect(() => {
    const productId = form.id.trim();
    if (!productId || !session) {
      setArchiveStatus(null);
      return;
    }
    const credentials = getAdminCredentials();
    if (!credentials) return;

    let cancelled = false;
    fetchArchiveStatus(credentials, productId)
      .then((status) => {
        if (!cancelled) setArchiveStatus(status);
      })
      .catch(() => {
        if (!cancelled) setArchiveStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [form.id, session]);

  if (loading) {
    return <PageShell showFooter={false} centered><p className="text-muted-foreground">Đang tải...</p></PageShell>;
  }

  if (!session) {
    return (
      <PageShell centered showFooter={false}>
        <div className="ts-card p-8 text-center space-y-4">
          <p>Bạn không có quyền truy cập trang này.</p>
          <Link href="/login"><Button className="brand-gradient rounded-full border-0">Đăng nhập admin</Button></Link>
        </div>
      </PageShell>
    );
  }

  const adminCredentials = getAdminCredentials();

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setZipFile(null);
    setArchiveStatus(null);
  }

  function suggestArchiveFileName(productId: string): string {
    const trimmed = productId.trim();
    if (!trimmed) return '';
    return trimmed.endsWith('.zip') ? trimmed : `${trimmed}.zip`;
  }

  async function uploadZip(productId: string, archiveFile: string): Promise<boolean> {
    if (!zipFile) return true;
    if (!adminCredentials) {
      toast({
        variant: 'destructive',
        title: 'Cần đăng nhập lại',
        description: 'Phiên upload hết hạn. Đăng xuất và đăng nhập admin lại để tải ZIP.',
      });
      return false;
    }
    setUploading(true);
    try {
      const result = await uploadProductArchive(adminCredentials, productId, zipFile, archiveFile);
      setArchiveStatus({
        productId: result.productId,
        fileName: result.fileName,
        fileOnDisk: true,
        fileSizeBytes: result.fileSizeBytes,
        uploadedAt: result.uploadedAt,
      });
      setZipFile(null);
      toast({
        title: 'Đã tải ZIP lên server',
        description: `${result.fileName} (${formatBytes(result.fileSizeBytes)})`,
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload thất bại',
        description: error instanceof Error ? error.message : 'Không thể tải file lên server.',
      });
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const youtubeRaw = form.youtubeUrl?.trim() ?? '';
    if (youtubeRaw && !extractYoutubeVideoId(youtubeRaw)) {
      toast({
        variant: 'destructive',
        title: 'Link YouTube không hợp lệ',
        description: 'Dùng link dạng youtube.com/watch?v=... hoặc youtu.be/...',
      });
      return;
    }

    const payload: CatalogProduct = {
      id: form.id.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      description: form.description.trim(),
      intro: form.intro?.trim() ?? '',
      youtubeUrl: youtubeRaw,
      imageUrls: parseImageUrlLines(form.imageUrlsText),
      archiveFile: form.archiveFile.trim() || suggestArchiveFileName(form.id),
      downloads: Number(form.downloads),
      featured: Boolean(form.featured),
    };
    if (!payload.id || !payload.name || !payload.description || !payload.archiveFile) return;

    if (zipFile) {
      const uploaded = await uploadZip(payload.id, payload.archiveFile);
      if (!uploaded) return;
    }

    const next = editingId
      ? products.map((item) => (item.id === editingId ? payload : item))
      : [payload, ...products];
    setProducts(next);
    saveCatalogProducts(next);
    resetForm();
    toast({ title: editingId ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm' });
  }

  function handleDelete(id: string) {
    const next = products.filter((item) => item.id !== id);
    setProducts(next);
    saveCatalogProducts(next);
    if (editingId === id) resetForm();
  }

  function handleEdit(product: CatalogProduct) {
    setEditingId(product.id);
    setForm({
      ...product,
      downloads: String(product.downloads),
      imageUrlsText: formatImageUrlLines(product.imageUrls),
    });
    setZipFile(null);
  }

  return (
    <PageShell mainClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <DashboardNav />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-2">Admin</p>
          <h1 className="font-display text-3xl font-semibold text-white">Quản lý catalog</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Metadata catalog: localStorage. File ZIP: upload qua form bên dưới (lưu server + mapping trong
            database). Cần đăng nhập admin trong phiên hiện tại để upload.
          </p>
        </div>
        <Link href="/browse"><Button variant="outline" className="btn-outline-dark rounded-full shrink-0">Xem trang sản phẩm</Button></Link>
      </div>

      {!adminCredentials && (
        <p className="text-sm text-amber-400/90 mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          Để upload ZIP, hãy đăng xuất và đăng nhập lại bằng tài khoản admin (mật khẩu dùng cho phiên upload).
        </p>
      )}

      <form onSubmit={handleSubmit} className="ts-card p-6 space-y-4 mb-6">
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className={inputClass}
            placeholder="ID (vd: laravel-ecommerce)"
            value={form.id}
            onChange={(e) => {
              const id = e.target.value;
              setForm((p) => ({
                ...p,
                id,
                archiveFile: p.archiveFile || suggestArchiveFileName(id),
              }));
            }}
            disabled={Boolean(editingId)}
          />
          <input className={`${inputClass} md:col-span-2`} placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className={inputClass} type="number" placeholder="Giá" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
          <select className={inputClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className={inputClass} type="number" placeholder="Lượt tải" value={form.downloads} onChange={(e) => setForm((p) => ({ ...p, downloads: e.target.value }))} />
          <input className={`${inputClass} md:col-span-3`} placeholder="Mô tả ngắn (hiện trên danh mục)" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <textarea
            className={`${inputClass} md:col-span-3 min-h-[120px] resize-y`}
            placeholder="Giới thiệu chi tiết (mỗi đoạn cách nhau một dòng trống)"
            value={form.intro ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-3`}
            placeholder="Link YouTube demo (https://www.youtube.com/watch?v=...)"
            value={form.youtubeUrl ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
          />
          <textarea
            className={`${inputClass} md:col-span-3 min-h-[80px] resize-y font-mono text-sm`}
            placeholder="URL ảnh demo — mỗi dòng một link https://..."
            value={form.imageUrlsText}
            onChange={(e) => setForm((p) => ({ ...p, imageUrlsText: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-2`}
            placeholder="Tên file ZIP trên server"
            value={form.archiveFile}
            onChange={(e) => setForm((p) => ({ ...p, archiveFile: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
            Nổi bật
          </label>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-4 space-y-3">
          <p className="text-sm font-medium text-white flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Upload file ZIP lên server
          </p>
          <input
            type="file"
            accept=".zip,application/zip"
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
          />
          {zipFile && (
            <p className="text-xs text-muted-foreground">
              Đã chọn: {zipFile.name} ({formatBytes(zipFile.size)})
            </p>
          )}
          {archiveStatus?.fileOnDisk && (
            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Trên server: {archiveStatus.fileName} ({formatBytes(archiveStatus.fileSizeBytes)})
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Giới hạn mặc định 200MB. File lưu tại thư mục download của backend (
            <code>DOWNLOAD_STORAGE_DIR</code>).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="brand-gradient rounded-full border-0" disabled={uploading}>
            {uploading ? 'Đang tải lên...' : editingId ? 'Lưu' : 'Thêm'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="btn-outline-dark rounded-full" onClick={resetForm}>
              Hủy
            </Button>
          )}
        </div>
      </form>

      <section className="ts-card p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Danh sách ({products.length})</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-border bg-card/60 p-4">
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{product.id} · {product.archiveFile}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={productDetailPath(product.id)}>
                  <Button size="sm" variant="outline" className="btn-outline-dark">Xem</Button>
                </Link>
                <Button size="sm" variant="outline" className="btn-outline-dark" onClick={() => handleEdit(product)}>Sửa</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Xóa</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
