'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Vendor, Product, PurchaseOrder, GRN, DashboardData } from '@/types/erp';

// Vendors
export function useVendors(search: string = '', showInactive: boolean = false) {
  return useQuery<Vendor[]>({
    queryKey: ['vendors', search, showInactive],
    queryFn: async () => {
      const { data } = await api.get(`/vendors?search=${search}&showInactive=${showInactive}`);
      return data;
    },
  });
}


export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Partial<Vendor>) => api.post('/vendors', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Partial<Vendor> & { id: string }) => api.put('/vendors', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

// Products
export function useProducts(search: string = '', showInactive: boolean = false) {
  return useQuery<Product[]>({
    queryKey: ['products', search, showInactive],
    queryFn: async () => {
      const { data } = await api.get(`/products?search=${search}&showInactive=${showInactive}`);
      return data;
    },
  });
}


export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Product>) => api.post('/products', p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<Product> & { id: string }) => api.put('/products', p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// Purchase Orders
export function usePurchaseOrders(status?: string) {
  return useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const { data } = await api.get(`/purchase-orders${params}`);
      return data;
    },
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (po: { vendorId: string; items: { productId: string; qty: number; rate: number }[] }) =>
      api.post<PurchaseOrder>('/purchase-orders', po),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useSubmitPO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/purchase-orders/${id}/submit`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

// GRN
export function useGRNs() {
  return useQuery<GRN[]>({
    queryKey: ['grns'],
    queryFn: async () => {
      const { data } = await api.get('/grn');
      return data;
    },
  });
}

export function usePendingPOItems(poId: string | undefined) {
  return useQuery<{ vendorName: string; items: any[] }>({
    queryKey: ['pending-po-items', poId],
    queryFn: async () => {
      const { data } = await api.get(`/grn/pending-po-items/${poId}`);
      return data;
    },
    enabled: !!poId,
  });
}

export function useCreateGRN() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (grn: { poId: string; items: any[] }) => api.post('/grn', grn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grns'] });
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['pending-po-items'] });
    },
  });
}

// Dashboard
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
  });
}
