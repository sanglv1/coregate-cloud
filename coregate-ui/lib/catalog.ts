export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  /** Mô tả ngắn (danh mục, thẻ). */
  description: string;
  /** Giới thiệu chi tiết trên trang sản phẩm. */
  intro?: string;
  /** Link YouTube (watch, youtu.be, embed). */
  youtubeUrl?: string;
  /** URL ảnh demo (screenshot, banner). */
  imageUrls?: string[];
  archiveFile: string;
  downloads: number;
  featured?: boolean;
}

export const PRODUCT_CATEGORIES = [
  'Java Spring Boot',
  'PHP',
  'C#',
  'NodeJs',
  'Python',
];

export const DEFAULT_PRODUCTS: CatalogProduct[] = [
  {
    id: 'vnpay-pay',
    name: 'Spring Boot — Payment Gateway Starter',
    price: 199000,
    category: 'Java Spring Boot',
    description: 'Mẫu tích hợp cổng thanh toán, webhook và xác nhận đơn hàng trên Spring Boot.',
    archiveFile: 'payment-demo.zip',
    downloads: 148,
    featured: true,
  },
  {
    id: 'spring-crud-admin',
    name: 'Spring Boot Admin & CRUD Pro',
    price: 349000,
    category: 'Java Spring Boot',
    description: 'Hệ thống quản trị đa module: user, phân quyền, audit log, REST API chuẩn.',
    archiveFile: 'spring-crud-admin.zip',
    downloads: 203,
    featured: true,
  },
  {
    id: 'laravel-ecommerce',
    name: 'Laravel E-Commerce Starter',
    price: 299000,
    category: 'PHP',
    description: 'Shop online: sản phẩm, giỏ hàng, đơn hàng, thanh toán và quản trị seller.',
    intro:
      'Bộ Laravel e-commerce gồm catalog sản phẩm, giỏ hàng, checkout, quản trị đơn hàng và phân quyền seller.\n\nPhù hợp triển khai shop B2C hoặc marketplace nhỏ. README hướng dẫn cài MySQL, chạy migration và cấu hình mail.',
    youtubeUrl: '',
    imageUrls: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80',
    ],
    archiveFile: 'laravel-ecommerce.zip',
    downloads: 176,
    featured: true,
  },
  {
    id: 'php-cms-blog',
    name: 'PHP CMS & Blog Engine',
    price: 189000,
    category: 'PHP',
    description: 'CMS nhẹ với editor, SEO, tag/category và API public cho frontend.',
    archiveFile: 'php-cms-blog.zip',
    downloads: 94,
  },
  {
    id: 'dotnet-clean-api',
    name: 'ASP.NET Core Clean Architecture API',
    price: 379000,
    category: 'C#',
    description: 'API .NET 8 theo Clean Architecture, EF Core, JWT và unit test mẫu.',
    archiveFile: 'dotnet-clean-api.zip',
    downloads: 121,
  },
  {
    id: 'dotnet-blazor-dashboard',
    name: 'Blazor Admin Dashboard',
    price: 329000,
    category: 'C#',
    description: 'Dashboard quản trị Blazor Server với biểu đồ, bảng dữ liệu và CRUD.',
    archiveFile: 'dotnet-blazor-dashboard.zip',
    downloads: 88,
  },
  {
    id: 'nodejs-express-api',
    name: 'Node.js Express API Boilerplate',
    price: 249000,
    category: 'NodeJs',
    description: 'REST API Express + TypeScript, auth JWT, validation, logging và Docker.',
    archiveFile: 'nodejs-express-api.zip',
    downloads: 165,
  },
  {
    id: 'nestjs-microservice',
    name: 'NestJS Microservice Template',
    price: 289000,
    category: 'NodeJs',
    description: 'Kiến trúc module NestJS, queue, config và health check cho microservice.',
    archiveFile: 'nestjs-microservice.zip',
    downloads: 102,
  },
  {
    id: 'python-fastapi-saas',
    name: 'FastAPI SaaS Backend',
    price: 269000,
    category: 'Python',
    description: 'API FastAPI đa tenant, subscription, email job và migration Alembic.',
    archiveFile: 'python-fastapi-saas.zip',
    downloads: 134,
  },
  {
    id: 'python-django-marketplace',
    name: 'Django Digital Marketplace',
    price: 319000,
    category: 'Python',
    description: 'Marketplace sản phẩm số: upload, duyệt bài, thanh toán và tải file.',
    archiveFile: 'python-django-marketplace.zip',
    downloads: 97,
  },
  {
    id: 'vnpay-merchant-hosted',
    name: 'Merchant Hosted Checkout (Java)',
    price: 249000,
    category: 'Java Spring Boot',
    description: 'Mẫu hosted checkout — tùy biến giao diện thanh toán trên hệ thống của bạn.',
    archiveFile: 'merchant-hosted-demo.zip',
    downloads: 92,
  },
];

export const CATALOG_STORAGE_KEY = 'coregate.catalog.products';

export function loadCatalogProducts(): CatalogProduct[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PRODUCTS;
  }
  const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(raw) as CatalogProduct[];
    if (parsed.length === 0) {
      return DEFAULT_PRODUCTS;
    }
    return parsed.map(normalizeProduct);
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveCatalogProducts(products: CatalogProduct[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));
}

export function findCatalogProduct(
  products: CatalogProduct[],
  id: string,
): CatalogProduct | undefined {
  const normalized = id.trim().toLowerCase();
  return products.find((p) => p.id.toLowerCase() === normalized);
}

export function productDetailPath(productId: string): string {
  return `/products/${encodeURIComponent(productId)}`;
}

function normalizeProduct(product: CatalogProduct): CatalogProduct {
  const category = PRODUCT_CATEGORIES.includes(product.category)
    ? product.category
    : 'Java Spring Boot';
  const imageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls.map((u) => u.trim()).filter((u) => u.length > 0)
    : [];
  return {
    ...product,
    name: product.name.trim(),
    category,
    description: product.description?.trim() ?? '',
    intro: product.intro?.trim() ?? '',
    youtubeUrl: product.youtubeUrl?.trim() ?? '',
    imageUrls,
  };
}
