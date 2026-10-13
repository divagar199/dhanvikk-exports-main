import { api } from '@/lib/api';
import type { Product } from '@/types/models';

export async function getProducts(
  params: Record<string, string | number | undefined> = {}
): Promise<Product[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') {
      query.set(k, String(v));
    }
  });

  const path = '/api/products' + (query.toString() ? '?' + query.toString() : '');
  const data = await api<any>(path);

  if (Array.isArray(data)) return data;
  if (data?.products && Array.isArray(data.products)) return data.products;
  return [];
}

export async function getProduct(id: string): Promise<Product> {
  const data = await api<any>('/api/products/' + encodeURIComponent(id));
  return data?.product || data;
}