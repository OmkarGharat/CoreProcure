import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { GRNItem, PendingPOItem } from '../types/grn';

interface CreateGRNPayload {
  poId: string;
  items: Omit<GRNItem, 'productName' | 'orderedQty'>[]; // Frontend sends these; backend enriches them
}

export const usePendingPOItems = (poId: string | undefined) => {
  return useQuery<{ vendorName: string; items: PendingPOItem[] }>({
    queryKey: ['pending-po-items', poId],
    queryFn: async () => {
      const { data } = await api.get(`/grn/pending-po-items/${poId}`);
      return data;
    },
    enabled: !!poId,
  });
};

export const useCreateGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grnData: CreateGRNPayload) => api.post('/grn', grnData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-po-items'] });
    },
  });
};
