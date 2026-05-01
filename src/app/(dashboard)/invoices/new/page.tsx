'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePendingInvoiceGRNs, useCreateInvoice } from '@/hooks/useERP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, ArrowLeft, Loader2, Save, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: pendingGRNs, isLoading: isLoadingGRNs } = usePendingInvoiceGRNs();
  const createInvoice = useCreateInvoice();

  const [selectedGRNId, setSelectedGRNId] = useState('');
  const [externalInvNo, setExternalInvNo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxAmount, setTaxAmount] = useState(0);

  const selectedGRN = useMemo(() => 
    pendingGRNs?.find(g => g.id === selectedGRNId),
    [pendingGRNs, selectedGRNId]
  );

  const subTotal = useMemo(() => {
    if (!selectedGRN) return 0;
    return selectedGRN.items.reduce((acc: number, item: any) => acc + (item.acceptedQty * item.rate), 0);
  }, [selectedGRN]);

  const grandTotal = subTotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGRNId) return toast.error('Please select a GRN');
    if (!selectedGRN) return toast.error('Selected GRN data not found');
    if (!externalInvNo) return toast.error('Vendor Invoice Number is required');

    createInvoice.mutate({
      grnId: selectedGRNId,
      externalInvoiceNumber: externalInvNo,
      dueDate,
      totalAmount: subTotal,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      items: selectedGRN.items
    }, {

      onSuccess: () => {
        toast.success('Vendor Invoice created successfully');
        router.push('/invoices');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create invoice')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Vendor Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Select GRN *</Label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={selectedGRNId}
                      onChange={(e) => setSelectedGRNId(e.target.value)}
                    >
                      <option value="">-- Select Inspected GRN --</option>
                      {pendingGRNs?.map(grn => (
                        <option key={grn.id} value={grn.id}>{grn.grnNumber} - {grn.vendorName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor Invoice Number *</Label>
                    <Input 
                      required
                      value={externalInvNo} 
                      onChange={(e) => setExternalInvNo(e.target.value)} 
                      placeholder="e.g. V-2024-001" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date"
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedGRN && (
              <Card className="border-slate-200/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-semibold">Billed Items (from GRN)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGRN.items.map((item: any) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                          <TableCell className="text-right font-mono">{item.acceptedQty}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.rate}</TableCell>
                          <TableCell className="text-right font-bold">
                            ₹{(item.acceptedQty * item.rate).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Sub Total</span>
                  <span className="font-mono">₹{subTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Tax / Adjustments</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">₹</span>
                    <Input 
                      type="number"
                      className="h-9 text-right font-mono"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <Button 
                  type="submit" 
                  disabled={!selectedGRNId || createInvoice.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-lg font-semibold"
                >
                  {createInvoice.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" />Save Invoice</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
