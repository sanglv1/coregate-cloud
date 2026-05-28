export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
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
    name: 'VNPAY Pay Demo',
    price: 199000,
    category: 'Java Spring Boot',
    description: 'Thanh toan co ban voi luong tao URL thanh toan va callback.',
    archiveFile: 'payment-demo.zip',
    downloads: 148,
    featured: true,
  },
  {
    id: 'vnpay-merchant-hosted',
    name: 'VNPAY Merchant Hosted Demo',
    price: 249000,
    category: 'Java Spring Boot',
    description: 'Mo hinh merchant-hosted de host giao dien thanh toan tren he thong cua ban.',
    archiveFile: 'merchant-hosted-demo.zip',
    downloads: 92,
    featured: true,
  },
  {
    id: 'vnpay-payment-link',
    name: 'VNPAY Payment Link Demo',
    price: 219000,
    category: 'Java Spring Boot',
    description: 'Tao va quan ly payment link cho don hang nhanh.',
    archiveFile: 'paymentlink-demo.zip',
    downloads: 110,
  },
  {
    id: 'vnpay-token',
    name: 'VNPAY Token Demo',
    price: 229000,
    category: 'Java Spring Boot',
    description: 'Luu va su dung token hoa thong tin thanh toan an toan.',
    archiveFile: 'token-demo.zip',
    downloads: 87,
  },
  {
    id: 'vnpay-installment',
    name: 'VNPAY Installment Demo',
    price: 239000,
    category: 'Java Spring Boot',
    description: 'Tich hop thanh toan tra gop va xu ly tham so ky thuat lien quan.',
    archiveFile: 'installment-demo.zip',
    downloads: 64,
  },
  {
    id: 'vnpay-recurring',
    name: 'VNPAY Recurring Demo',
    price: 239000,
    category: 'Java Spring Boot',
    description: 'Trien khai luong thanh toan dinh ky recurring cho subscription.',
    archiveFile: 'recurring-demo.zip',
    downloads: 73,
  },
  {
    id: 'vnpay-preauth',
    name: 'VNPAY Preauth Demo',
    price: 259000,
    category: 'Java Spring Boot',
    description: 'Dat coc/giu tien truoc (preauth), capture hoac huy theo nghiep vu.',
    archiveFile: 'preauth-demo.zip',
    downloads: 51,
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

function normalizeProduct(product: CatalogProduct): CatalogProduct {
  const cleanedName = product.name.replace(/\s*\(Java Spring Boot\)\s*/gi, '').trim();
  return {
    ...product,
    name: cleanedName,
    category: 'Java Spring Boot',
  };
}
