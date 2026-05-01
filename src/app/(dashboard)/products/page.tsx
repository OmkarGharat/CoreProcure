'use client';


import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useERP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, Loader2, Pencil, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/erp';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ itemCode: '', description: '', uom: 'Nos', valuationRate: 0, isActive: true });

  const { data: products, isLoading } = useProducts(search, showInactive);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const openCreate = () => {
    setEditProduct(null);
    setForm({ itemCode: '', description: '', uom: 'Nos', valuationRate: 0, isActive: true });
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      itemCode: product.itemCode,
      description: product.description,
      uom: product.uom,
      valuationRate: product.valuationRate,
      isActive: product.isActive ?? true,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      itemCode: form.itemCode.trim(),
      description: form.description.trim(),
      uom: form.uom,
      valuationRate: form.valuationRate,
      isActive: form.isActive,
    };

    if (editProduct) {
      updateProduct.mutate({ id: editProduct.id, ...payload }, {
        onSuccess: () => {
          toast.success('Product updated successfully');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update product'),
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          toast.success('Product created successfully');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create product'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your product catalog and inventory</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Code *</Label>
                  <Input required value={form.itemCode} onChange={(e) => setForm({ ...form, itemCode: e.target.value })} placeholder="e.g. ITEM-001" disabled={!!editProduct} />
                </div>
                <div className="space-y-2">
                  <Label>UOM *</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.uom}
                    onChange={(e) => setForm({ ...form, uom: e.target.value })}
                  >
                    <option value="Nos">Nos</option>
                    <option value="Kg">Kg</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Set">Set</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" />
              </div>
              <div className="space-y-2">
                <Label>Valuation Rate (₹)</Label>
                <Input type="number" min={0} step="0.01" value={form.valuationRate} onChange={(e) => setForm({ ...form, valuationRate: Number(e.target.value) })} />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Active Status</Label>
                  <p className="text-xs text-slate-500">Enable or disable this product</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  {(createProduct.isPending || updateProduct.isPending) ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : editProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            className="pl-9 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <input 
            id="showInactive"
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <label htmlFor="showInactive" className="cursor-pointer">Show inactive products</label>
        </div>
      </div>


      {/* Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600">Item Code</TableHead>
                <TableHead className="font-semibold text-slate-600">Description</TableHead>
                <TableHead className="font-semibold text-slate-600">UOM</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Stock Qty</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Valuation Rate</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Stock Value</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-400">Loading products...</TableCell></TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-medium">No products found</p>
                      <p className="text-slate-300 text-sm">Create your first product to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 cursor-pointer group">
                    <TableCell>
                      <span className="font-mono font-medium text-emerald-600">{p.itemCode}</span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{p.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">{p.uom}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{p.stockQty}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="w-3 h-3 text-slate-400" />
                        {p.valuationRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      ₹{(p.stockQty * p.valuationRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-0 text-xs`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">

                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => openEdit(p)}>
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
