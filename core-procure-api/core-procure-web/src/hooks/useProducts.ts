import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Product {
  _id: string;
  itemCode: string;
  description: string;
  uom: string;
  valuationRate: number;
}

export const useProductsSearch = (search: string) => {
  return useQuery<Product[]>({
    queryKey: ['products-search', search],
    queryFn: async () => {
      if (!search || search.length < 2) return []; // Don't fetch until user types 2 chars
      const { data } = await api.get(`/products?search=${search}`);
      return data;
    },
    enabled: search.length >= 2,
  });
};
