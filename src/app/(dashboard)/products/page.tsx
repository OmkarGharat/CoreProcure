'use client';


import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Pencil,
  Package,
  Loader2,
  Info,
  ShoppingCart,
  Boxes,
  Calculator,
  Settings2
} from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useERP';
import { toast } from 'sonner';
import type { Product } from '@/types/erp';


const INITIAL_FORM = {
  productNumber: '',
  productCode: '',
  description: '',
  category: '',
  isActive: true,

  // Purchase
  purchaseUom: 'Nos',
  purchaseRate: 0,
  preferredVendor: '',
  leadTime: 0,
  taxCode: '',

  // Inventory
  stockUom: 'Nos',
  valuationRate: 0,
  inventoryFlag: true,
  reorderLevel: 0,
  qcRequired: false,
  lotSerialTracking: 'None' as 'None' | 'Lot' | 'Serial',


  // Accounting
  inventoryAccount: '',
  expenseAccount: '',

  // Advanced
  dimensions: '',
  weight: '',
  brand: '',
  alternates: '',
  attachments: '',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState(INITIAL_FORM);

  const { data: products, isLoading } = useProducts(search, showInactive);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const openCreate = () => {
    setEditProduct(null);
    setForm(INITIAL_FORM);
    setOriginalForm(INITIAL_FORM);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    const editData = {
      productNumber: product.productNumber || '',
      productCode: product.productCode || (product as any).itemCode || '',
      description: product.description,
      category: product.category || '',
      isActive: product.isActive ?? true,
      purchaseUom: product.purchaseUom || 'Nos',
      purchaseRate: product.purchaseRate || 0,
      preferredVendor: product.preferredVendor || '',
      leadTime: product.leadTime || 0,
      taxCode: product.taxCode || '',
      stockUom: product.stockUom || (product as any).uom || 'Nos',
      valuationRate: product.valuationRate || 0,
      inventoryFlag: product.inventoryFlag ?? true,
      reorderLevel: product.reorderLevel || 0,
      qcRequired: product.qcRequired ?? false,
      lotSerialTracking: product.lotSerialTracking || 'None',
      inventoryAccount: product.inventoryAccount || '',
      expenseAccount: product.expenseAccount || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      brand: product.brand || '',
      alternates: product.alternates || '',
      attachments: product.attachments || '',
    };
    setEditProduct(product);
    setForm(editData);
    setOriginalForm(editData);
    setOpen(true);
  };

  const hasChanges = () => {
    if (!editProduct) return true; // Always allow for new products
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct && !hasChanges()) {
      setOpen(false);
      return;
    }

    const payload = {
      ...form,
      productNumber: (form.productNumber || '').trim() || undefined,
      productCode: (form.productCode || '').trim(),
      description: (form.description || '').trim(),
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
          <DialogContent
            className="sm:max-w-2xl"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                {editProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="general" className="text-xs">
                    <Info className="w-3 h-3 mr-1.5" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="purchase" className="text-xs">
                    <ShoppingCart className="w-3 h-3 mr-1.5" />
                    Purchase
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="text-xs">
                    <Boxes className="w-3 h-3 mr-1.5" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="accounting" className="text-xs">
                    <Calculator className="w-3 h-3 mr-1.5" />
                    Accounting
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">
                    <Settings2 className="w-3 h-3 mr-1.5" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <div className="min-h-[380px]">
                  <TabsContent value="general" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product Number</Label>
                        <Input value={form.productNumber} onChange={(e) => setForm({ ...form, productNumber: e.target.value })} placeholder="Auto-generated" readOnly={!!editProduct} className="bg-slate-50 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label>Product Code *</Label>
                        <Input required value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} placeholder="e.g. ITEM-001" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Raw Material" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 self-end h-[42px]">
                        <Label className="text-sm font-semibold">Active Status</Label>
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="purchase" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Purchase UOM</Label>
                        <Input value={form.purchaseUom} onChange={(e) => setForm({ ...form, purchaseUom: e.target.value })} placeholder="e.g. Box" />
                      </div>
                      <div className="space-y-2">
                        <Label>Purchase Rate (₹)</Label>
                        <Input type="number" value={form.purchaseRate} onChange={(e) => setForm({ ...form, purchaseRate: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Vendor</Label>
                      <Input value={form.preferredVendor} onChange={(e) => setForm({ ...form, preferredVendor: e.target.value })} placeholder="Vendor name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lead Time (Days)</Label>
                        <Input type="number" value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Code</Label>
                        <Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} placeholder="GST-18" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="inventory" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Stock UOM *</Label>
                        <Input required value={form.stockUom} onChange={(e) => setForm({ ...form, stockUom: e.target.value })} placeholder="e.g. Nos" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valuation Rate (₹)</Label>
                        <Input type="number" value={form.valuationRate} onChange={(e) => setForm({ ...form, valuationRate: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-emerald-50/30 border-emerald-100">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="invFlag" checked={form.inventoryFlag} onChange={(e) => setForm({ ...form, inventoryFlag: e.target.checked })} />
                        <Label htmlFor="invFlag" className="cursor-pointer">Maintain Inventory</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="qcReq" checked={form.qcRequired} onChange={(e) => setForm({ ...form, qcRequired: e.target.checked })} />
                        <Label htmlFor="qcReq" className="cursor-pointer">QC Required</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Reorder Level</Label>
                        <Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Lot/Serial Tracking</Label>
                        <select className="w-full h-9 rounded-md border px-3 text-sm" value={form.lotSerialTracking} onChange={(e) => setForm({ ...form, lotSerialTracking: e.target.value as any })}>
                          <option value="None">None</option>
                          <option value="Lot">Lot Tracking</option>
                          <option value="Serial">Serial Tracking</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="accounting" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Inventory Account</Label>
                      <Input value={form.inventoryAccount} onChange={(e) => setForm({ ...form, inventoryAccount: e.target.value })} placeholder="Inventory Assets" />
                    </div>
                    <div className="space-y-2">
                      <Label>Expense / COGS Account</Label>
                      <Input value={form.expenseAccount} onChange={(e) => setForm({ ...form, expenseAccount: e.target.value })} placeholder="Cost of Goods Sold" />
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brand</Label>
                        <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Dimensions</Label>
                      <Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="L x W x H" />
                    </div>
                    <div className="space-y-2">
                      <Label>Alternates</Label>
                      <textarea className="w-full rounded-md border p-2 text-sm" rows={2} value={form.alternates} onChange={(e) => setForm({ ...form, alternates: e.target.value })} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending || !!(editProduct && !hasChanges())}

                  className={`${editProduct && !hasChanges() ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {(createProduct.isPending || updateProduct.isPending) ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : editProduct ? (hasChanges() ? 'Update Product' : 'No Changes') : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


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

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600 w-[120px]">Number</TableHead>
                <TableHead className="font-semibold text-slate-600">Product Code</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="font-semibold text-slate-600">Stock UOM</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">Loading products...</TableCell></TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
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
                    <TableCell className="font-mono text-xs font-bold text-emerald-600">{p.productNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-medium text-slate-900">{p.productCode}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[200px]">{p.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.category ? <Badge variant="secondary" className="font-normal">{p.category}</Badge> : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">{p.stockUom}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-0 text-xs`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
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
