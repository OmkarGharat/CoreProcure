'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePendingInvoices, useCreatePayment } from '@/hooks/useERP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowLeft, Loader2, Save, IndianRupee, Landmark } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewPaymentPage() {
  const router = useRouter();
  const { data: pendingInvoices, isLoading: isLoadingInvoices } = usePendingInvoices();
  const createPayment = useCreatePayment();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedInvoice = useMemo(() => 
    pendingInvoices?.find(i => i.id === selectedInvoiceId),
    [pendingInvoices, selectedInvoiceId]
  );

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = pendingInvoices?.find(i => i.id === id);
    if (inv) {
      setAmount(inv.balanceAmount);
    } else {
      setAmount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return toast.error('Please select an invoice');
    if (amount <= 0) return toast.error('Amount must be greater than zero');

    createPayment.mutate({
      invoiceId: selectedInvoiceId,
      amountPaid: amount,
      paymentMode: mode,
      referenceNumber: reference,
      remarks,
    }, {
      onSuccess: () => {
        toast.success('Payment recorded successfully');
        router.push('/payments');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to record payment')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Record Vendor Payment</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Select Outstanding Invoice *</Label>
                <select
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                >
                  <option value="">-- Select Pending Invoice --</option>
                  {pendingInvoices?.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} ({inv.vendorName}) - Bal: ₹{inv.balanceAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input 
                    required
                    type="number"
                    step="0.01"
                    className="pl-7 font-mono font-bold"
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    max={selectedInvoice?.balanceAmount}
                  />
                </div>
                {selectedInvoice && (
                  <p className="text-[11px] text-slate-500">
                    Maximum allowed: ₹{selectedInvoice.balanceAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Payment Mode *</Label>
                <select
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Reference Number (UTR / Cheque No.)</Label>
                <Input 
                  value={reference} 
                  onChange={(e) => setReference(e.target.value)} 
                  placeholder="e.g. UTR123456789" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                placeholder="Internal notes..." 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/payments">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button 
            type="submit" 
            disabled={!selectedInvoiceId || createPayment.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-md min-w-[140px]"
          >
            {createPayment.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
            ) : (
              <><CreditCard className="w-4 h-4 mr-2" />Record Payment</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
