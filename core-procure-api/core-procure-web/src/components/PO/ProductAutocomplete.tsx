import { useState } from 'react';
import { useProductsSearch } from '../../hooks/useProducts';
import type { Product } from '../../hooks/useProducts';

interface Props {
  onSelect: (product: Product) => void;
}

export default function ProductAutocomplete({ onSelect }: Props) {
  const [search, setSearch] = useState('');
  const { data: products, isLoading } = useProductsSearch(search);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Type item code or name..."
        className="w-full border rounded px-3 py-2 text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      {search.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {isLoading && <p className="p-2 text-sm text-gray-500">Searching...</p>}
          {!isLoading && products?.length === 0 && <p className="p-2 text-sm text-gray-500">No products found</p>}
          {products?.map((p) => (
            <button
              key={p._id}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-0 text-sm flex justify-between"
              onClick={() => {
                onSelect(p);
                setSearch('');
              }}
            >
              <span className="font-medium">{p.itemCode}</span>
              <span className="text-gray-500">{p.description}</span>
              <span className="text-gray-400 text-xs">{p.uom}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
