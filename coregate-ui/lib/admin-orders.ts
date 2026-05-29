import type { AdminCredentials } from '@/lib/hooks/useAuth';

export interface OrderSummary {
  id: string;
  customerEmail: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paymentStatus: string | null;
  txnRef: string | null;
  itemCount: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDetail {
  order: {
    id: string;
    customerId: string;
    customerEmail: string | null;
    status: string;
    totalAmount: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
  };
  paymentStatus: string | null;
  txnRef: string | null;
  paymentProvider: string | null;
}

function adminHeaders(credentials: AdminCredentials): HeadersInit {
  return {
    'X-Admin-Username': credentials.username,
    'X-Admin-Password': credentials.password,
  };
}

export async function fetchAdminOrders(credentials: AdminCredentials): Promise<OrderSummary[]> {
  const response = await fetch('/api/admin/orders', {
    headers: adminHeaders(credentials),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Không tải được danh sách đơn hàng');
  }
  return (payload.orders ?? []) as OrderSummary[];
}

export async function fetchAdminOrderDetail(
  credentials: AdminCredentials,
  orderId: string,
): Promise<OrderDetail> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    headers: adminHeaders(credentials),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Không tải được chi tiết đơn hàng');
  }
  return payload as OrderDetail;
}
