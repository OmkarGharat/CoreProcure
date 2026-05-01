'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendors, useProducts, useCreatePO, useSubmitPO } from '@/hooks/useERP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Loader2, Search, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/erp';

interface POFormItem {
  productId: string;
  productName: string;
  uom: string;
  qty: number;
  rate: number;
}

export default function PurchaseOrderFormPage() {
  const router = useRouter();
  const { data: vendors } = useVendors('');
  const { data: allProducts } = useProducts('');
  const createPO = useCreatePO();
  const submitPO = useSubmitPO();

  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<POFormItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const filteredProducts = allProducts?.filter(
    (p) =>
      p.itemCode.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase())
  ) || [];

  const addProduct = (product: Product) => {
    if (items.find((i) => i.productId === product.id)) {
      toast.error('Product already added');
      return;
    }
    setItems([
      ...items,
      {
        productId: product.id,
        productName: `${product.itemCode} - ${product.description}`,
        uom: product.uom,
        qty: 1,
        rate: product.valuationRate || 0,
      },
    ]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const updateItem = (index: number, field: 'qty' | 'rate', value: number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  const handleSaveDraft = () => {
    if (!vendorId || items.length === 0) return toast.error('Select vendor and add items');
    const payload = {
      vendorId,
      items: items.map(({ productId, qty, rate }) => ({ productId, qty, rate })),
    };
    createPO.mutate(payload, {
      onSuccess: () => {
        toast.success('PO saved as draft');
        router.push('/purchase-orders');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create PO'),
    });
  };

  const handleSubmit = () => {
    if (!vendorId || items.length === 0) return toast.error('Select vendor and add items');
    const payload = {
      vendorId,
      items: items.map(({ productId, qty, rate }) => ({ productId, qty, rate })),
    };
    createPO.mutate(payload, {
      onSuccess: (res) => {
        submitPO.mutate(res.data.id, {
          onSuccess: () => {
            toast.success('PO created and submitted');
            router.push('/purchase-orders');
          },
        });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create PO'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/purchase-orders')} className="text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-slate-900">New Purchase Order</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/purchase-orders')} className="border-slate-200">Cancel</Button>
          <Button variant="secondary" onClick={handleSaveDraft} disabled={createPO.isPending} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={createPO.isPending || submitPO.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {(createPO.isPending || submitPO.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save & Submit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vendor Details */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Supplier Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Vendor *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">-- Search/Select Vendor --</option>
                {vendors?.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}{v.gst ? ` (${v.gst})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="pt-4 border-t border-dashed border-slate-200">
              <p className="text-xs text-slate-400">PO Number will be auto-generated on save</p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Line Items */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Product Search */}
            <div className="mb-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products by code or name to add..."
                  className="pl-9 border-slate-200"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(e.target.value.length >= 1);
                  }}
                  onFocus={() => productSearch && setShowProductDropdown(true)}
                />
              </div>
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 border-b border-slate-50 last:border-0 text-sm flex items-center justify-between transition-colors"
                      onClick={() => addProduct(p)}
                    >
                      <div>
                        <span className="font-mono font-medium text-emerald-600">{p.itemCode}</span>
                        <span className="text-slate-500 ml-2">{p.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{p.uom}</Badge>
                        <span className="text-xs text-slate-400">₹{p.valuationRate}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Item</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead className="w-[120px]">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      Search and add products above
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{item.uom}</Badge></TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        className="w-20 h-8 text-sm"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="w-28 h-8 text-sm"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ₹{(item.qty * item.rate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(index)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total */}
            {items.length > 0 && (
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
