import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PurchaseOrder } from '../types/purchaseOrder';

interface CreatePOPayload {
  vendorId: string;
  items: {
    productId: string;
    qty: number;
    rate: number;
  }[];
}

export const usePurchaseOrders = (status?: string) => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const { data } = await api.get(`/purchase-orders${params}`);
      return data;
    },
  });
};

export const useCreatePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poData: CreatePOPayload) => api.post<PurchaseOrder>('/purchase-orders', poData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useSubmitPO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/purchase-orders/${id}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};
