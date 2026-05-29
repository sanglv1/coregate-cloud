export interface AdminCredentials {
  username: string;
  password: string;
}

export interface UploadArchiveResult {
  productId: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface ArchiveStatus {
  productId: string;
  fileName: string;
  fileOnDisk: boolean;
  fileSizeBytes: number;
  uploadedAt: string | null;
}

function adminHeaders(credentials: AdminCredentials): HeadersInit {
  return {
    'X-Admin-Username': credentials.username,
    'X-Admin-Password': credentials.password,
  };
}

export async function uploadProductArchive(
  credentials: AdminCredentials,
  productId: string,
  file: File,
  fileName?: string,
): Promise<UploadArchiveResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('productId', productId);
  if (fileName?.trim()) {
    form.append('fileName', fileName.trim());
  }

  const response = await fetch('/api/admin/product-archives/upload', {
    method: 'POST',
    headers: adminHeaders(credentials),
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Upload thất bại');
  }
  return payload as UploadArchiveResult;
}

export async function fetchArchiveStatus(
  credentials: AdminCredentials,
  productId: string,
): Promise<ArchiveStatus | null> {
  const response = await fetch(
    `/api/admin/product-archives/${encodeURIComponent(productId)}`,
    { headers: adminHeaders(credentials) },
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Không kiểm tra được trạng thái file');
  }
  return (await response.json()) as ArchiveStatus;
}
