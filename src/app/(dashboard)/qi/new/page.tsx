'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePendingGRNs, useCreateQI } from '@/hooks/useERP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewQualityInspectionPage() {
  const router = useRouter();
  const { data: pendingGRNs, isLoading: isLoadingGRNs } = usePendingGRNs();
  const createQI = useCreateQI();

  const [selectedGRNId, setSelectedGRNId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [inspectedBy, setInspectedBy] = useState('');

  const selectedGRN = useMemo(() => 
    pendingGRNs?.find(g => g.id === selectedGRNId),
    [pendingGRNs, selectedGRNId]
  );

  const handleGRNChange = (id: string) => {
    setSelectedGRNId(id);
    const grn = pendingGRNs?.find(g => g.id === id);
    if (grn) {
      const grnItems = grn.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        receivedQty: item.acceptedQty, // How much was accepted at GRN
        inspectedQty: item.acceptedQty,
        acceptedQty: item.acceptedQty,
        rejectedQty: 0,
        remarks: ''
      }));
      setItems(grnItems);
    } else {
      setItems([]);
    }
  };

  const updateItem = (productId: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: value };
        if (field === 'acceptedQty') {
          updated.rejectedQty = updated.receivedQty - value;
        } else if (field === 'rejectedQty') {
          updated.acceptedQty = updated.receivedQty - value;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGRNId) return toast.error('Please select a GRN');

    createQI.mutate({
      grnId: selectedGRNId,
      items,
      inspectedBy
    }, {
      onSuccess: () => {
        toast.success('Quality Inspection submitted successfully');
        router.push('/qi');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit inspection')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/qi">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Quality Inspection</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              Inspection Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Select Goods Receipt (GRN) *</Label>
                <select
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedGRNId}
                  onChange={(e) => handleGRNChange(e.target.value)}
                >
                  <option value="">-- Select GRN --</option>
                  {pendingGRNs?.map(grn => (
                    <option key={grn.id} value={grn.id}>{grn.grnNumber} - {grn.vendorName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Inspected By</Label>
                <Input 
                  value={inspectedBy} 
                  onChange={(e) => setInspectedBy(e.target.value)} 
                  placeholder="Inspector Name" 
                />
              </div>
            </div>

            {selectedGRN && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Vendor</p>
                  <p className="font-semibold text-slate-900">{selectedGRN.vendorName}</p>
                </div>
                <div>
                  <p className="text-slate-500">GRN Date</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedGRN.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card className="border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold">Inspection Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right w-32">Accepted</TableHead>
                    <TableHead className="text-right w-32">Rejected</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                      <TableCell className="text-right font-mono">{item.receivedQty}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="h-8 text-right"
                          min={0}
                          max={item.receivedQty}
                          value={item.acceptedQty}
                          onChange={(e) => updateItem(item.productId, 'acceptedQty', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        {item.rejectedQty}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          placeholder="Note..."
                          value={item.remarks}
                          onChange={(e) => updateItem(item.productId, 'remarks', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/qi">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button 
            type="submit" 
            disabled={!selectedGRNId || createQI.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-md min-w-[140px]"
          >
            {createQI.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Submit QI</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
