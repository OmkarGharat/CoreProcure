import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '../hooks/useVendors';
import { useCreatePO, useSubmitPO } from '../hooks/usePurchaseOrders';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import ProductAutocomplete from '../components/PO/ProductAutocomplete';
import type { Product } from '../hooks/useProducts';
import type { POItem } from '../types/purchaseOrder';

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { data: vendors } = useVendors('');
  const createPO = useCreatePO();
  const submitPO = useSubmitPO();

  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<POItem[]>([]);
  const [showProductSearch, setShowProductSearch] = useState<number | null>(null);

  const handleAddProduct = (product: Product, index: number | null) => {
    const newItem: POItem = {
      productId: product._id,
      productName: `${product.itemCode} - ${product.description}`,
      uom: product.uom,
      qty: 1,
      rate: product.valuationRate || 0, // Default to current valuation rate
      receivedQty: 0,
    };

    if (index !== null) {
      setItems(items.map((item, i) => (i === index ? newItem : item)));
    } else {
      setItems([...items, newItem]);
    }
    setShowProductSearch(null);
  };

  const updateItem = (index: number, field: 'qty' | 'rate', value: number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);

  const handleSaveDraft = () => {
    if (!vendorId || items.length === 0) return alert("Select vendor and add items");
    const payload = { vendorId, items: items.map(({ productId, qty, rate }) => ({ productId, qty, rate })) };
    createPO.mutate(payload, {
      onSuccess: () => navigate('/purchase-orders')
    });
  };

  const handleSubmit = () => {
    if (!vendorId || items.length === 0) return alert("Select vendor and add items");
    const payload = { vendorId, items: items.map(({ productId, qty, rate }) => ({ productId, qty, rate })) };
    // Save draft first, then submit using the returned PO _id
    createPO.mutate(payload, {
      onSuccess: (res) => {
        submitPO.mutate(res.data._id, {
          onSuccess: () => navigate('/purchase-orders')
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold">New Purchase Order</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/purchase-orders')}>Cancel</Button>
          <Button variant="secondary" onClick={handleSaveDraft} disabled={createPO.isPending}>Save as Draft</Button>
          <Button onClick={handleSubmit} disabled={createPO.isPending || submitPO.isPending}>
            {submitPO.isPending ? 'Submitting...' : 'Save & Submit'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Header & Vendor */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Supplier Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Vendor</label>
              <select 
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">-- Search/Select --</option>
                {vendors?.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">PO Number will be generated automatically upon saving.</p>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Line Items Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Order Items</CardTitle>
            <Button size="sm" onClick={() => setShowProductSearch(items.length)}>+ Add Item</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Item</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No items added</TableCell></TableRow>
                )}
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {showProductSearch === index ? (
                        <ProductAutocomplete onSelect={(p) => handleAddProduct(p, index)} />
                      ) : (
                        <p className="text-sm cursor-pointer hover:underline" onClick={() => setShowProductSearch(index)}>{item.productName}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{item.uom}</TableCell>
                    <TableCell>
                      <Input type="number" min={1} className="w-20" value={item.qty} onChange={(e) => updateItem(index, 'qty', Number(e.target.value))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} className="w-24" value={item.rate} onChange={(e) => updateItem(index, 'rate', Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(item.qty * item.rate).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-xs">X</button>
                    </TableCell>
                  </TableRow>
                ))}
                {showProductSearch === items.length && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <ProductAutocomplete onSelect={(p) => handleAddProduct(p, null)} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="flex justify-end mt-4 pr-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
