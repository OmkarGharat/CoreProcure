export const dynamic = 'force-dynamic';

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchaseOrders, usePendingPOItems, useCreateGRN } from '@/hooks/useERP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GRNFormItem {
  productId: string;
  poLineId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rate: number;
  warehouseId: string;
}

export default function GRNFormPage() {
  const router = useRouter();
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [error, setError] = useState('');

  const { data: pos } = usePurchaseOrders();
  const { data: poDetails, isLoading: loadingItems } = usePendingPOItems(selectedPO || undefined);
  const createGRN = useCreateGRN();

  const [manualItems, setManualItems] = useState<GRNFormItem[] | null>(null);

  const items = useMemo(() => {
    if (manualItems) return manualItems;
    if (poDetails?.items) {
      return poDetails.items.map((poItem: any) => ({
        productId: poItem.productId,
        poLineId: poItem.productId,
        productName: poItem.productName,
        orderedQty: poItem.qty,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        rate: poItem.rate,
        warehouseId: 'WH-MAIN',
      }));
    }
    return [];
  }, [poDetails, manualItems]);

  // Reset manual items when PO changes
  const handlePOChange = (poId: string) => {
    setSelectedPO(poId);
    setManualItems(null);
  };

  const handleReceivedChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].receivedQty = value;
    newItems[index].acceptedQty = value;
    newItems[index].rejectedQty = 0;
    setManualItems(newItems);
    setError('');
  };

  const handleAcceptedChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].acceptedQty = value;
    newItems[index].rejectedQty = newItems[index].receivedQty - value;
    setManualItems(newItems);
  };

  const handlePostGRN = () => {
    const hasInvalidQty = items.some((i) => i.acceptedQty < 0 || i.rejectedQty < 0 || i.acceptedQty > i.receivedQty);
    if (hasInvalidQty) return setError('Invalid quantities. Accepted cannot exceed Received.');
    if (items.length > 0 && items.every((i) => i.receivedQty === 0))
      return setError('Please enter received quantities.');

    createGRN.mutate(
      {
        poId: selectedPO,
        items: items.map(({ poLineId, productId, receivedQty, acceptedQty, rejectedQty, rate, warehouseId }) => ({
          poLineId,
          productId,
          receivedQty,
          acceptedQty,
          rejectedQty,
          rate,
          warehouseId,
        })),
      },
      {
        onSuccess: () => {
          toast.success('GRN posted successfully');
          router.push('/grn');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to post GRN'),
      }
    );
  };

  const eligiblePOs = pos?.filter((po) => po.status === 'Submitted' || po.status === 'Partially Received') || [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/grn')} className="text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold text-slate-900">New Goods Receipt Note</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/grn')} className="border-slate-200">Cancel</Button>
          <Button onClick={handlePostGRN} disabled={createGRN.isPending || !selectedPO || items.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
            {createGRN.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Post GRN
          </Button>
        </div>
      </div>

      {/* PO Selection */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Select Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full max-w-lg h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedPO}
            onChange={(e) => handlePOChange(e.target.value)}
          >
            <option value="">-- Select a Submitted PO --</option>
            {eligiblePOs.map((po) => (
              <option key={po.id} value={po.id}>
                {po.poNumber} - {po.vendorName} ({po.items.length} items)
              </option>
            ))}
          </select>
          {eligiblePOs.length === 0 && (
            <p className="text-sm text-amber-600 mt-2">No submitted POs available. Create and submit a PO first.</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      {loadingItems && <p className="text-slate-400 text-sm">Loading items...</p>}

      {items.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Receipt Details — {poDetails?.vendorName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Accepted</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const poItem = poDetails?.items?.find((i: any) => i.productId === item.productId);
                  const pending = poItem ? poItem.qty - poItem.receivedQty : 0;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.orderedQty}</TableCell>
                      <TableCell className="text-right font-medium text-orange-600">{pending}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-24 h-8 text-sm ml-auto"
                          value={item.receivedQty || ''}
                          onChange={(e) => handleReceivedChange(index, Number(e.target.value))}
                          max={pending}
                          min={0}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-24 h-8 text-sm ml-auto"
                          value={item.acceptedQty || ''}
                          onChange={(e) => handleAcceptedChange(index, Number(e.target.value))}
                          max={item.receivedQty}
                          min={0}
                        />
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-medium">{item.rejectedQty}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
