'use client';


import { useState } from 'react';
import Link from 'next/link';
import { usePurchaseOrders, useSubmitPO } from '@/hooks/useERP';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const statusConfig: Record<string, { bg: string; text: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700' },
  Submitted: { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Partially Received': { bg: 'bg-orange-100', text: 'text-orange-700' },
  Closed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewPO, setViewPO] = useState<any>(null);
  const { data: pos, isLoading } = usePurchaseOrders(statusFilter || undefined);
  const submitPO = useSubmitPO();

  const handleSubmit = (id: string) => {
    submitPO.mutate(id, {
      onSuccess: () => toast.success('PO submitted successfully'),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit PO'),
    });
  };

  const filters = ['', 'Draft', 'Submitted', 'Partially Received', 'Closed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Track and manage all purchase orders</p>
        </div>
        <Link href="/purchase-orders/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </Button>
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f}
            variant={statusFilter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f)}
            className={statusFilter === f ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-200'}
          >
            {f || 'All'}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600">PO Number</TableHead>
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600">Items</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Total</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">Loading purchase orders...</TableCell></TableRow>
              ) : pos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-medium">No purchase orders found</p>
                      <p className="text-slate-300 text-sm">Create your first PO to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pos?.map((po) => {
                  const total = po.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
                  const sc = statusConfig[po.status] || statusConfig.Draft;
                  return (
                    <TableRow key={po.id} className="hover:bg-slate-50/50 group">
                      <TableCell>
                        <span className="font-mono font-semibold text-emerald-600">{po.poNumber}</span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{po.vendorName}</TableCell>
                      <TableCell className="text-slate-500">{po.items.length} items</TableCell>
                      <TableCell className="text-slate-500 text-sm">{new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <Badge className={`${sc.bg} ${sc.text} border-0 text-xs font-medium`}>{po.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setViewPO(po)}>
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </Button>
                          {po.status === 'Draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleSubmit(po.id)}
                              disabled={submitPO.isPending}
                            >
                              {submitPO.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View PO Dialog */}
      <Dialog open={!!viewPO} onOpenChange={() => setViewPO(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="font-mono text-emerald-600">{viewPO?.poNumber}</span>
              {viewPO && <Badge className={`${statusConfig[viewPO.status]?.bg} ${statusConfig[viewPO.status]?.text} border-0 text-xs`}>{viewPO.status}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {viewPO && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Vendor:</span> <span className="font-medium ml-2">{viewPO.vendorName}</span></div>
                <div><span className="text-slate-400">Date:</span> <span className="font-medium ml-2">{new Date(viewPO.createdAt).toLocaleDateString('en-IN')}</span></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewPO.items.map((item: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{item.uom}</Badge></TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-medium">₹{(item.qty * item.rate).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{viewPO.items.reduce((s: number, i: any) => s + i.qty * i.rate, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              {viewPO.status === 'Draft' && (
                <DialogFooter>
                  <Button onClick={() => { handleSubmit(viewPO.id); setViewPO(null); }} className="bg-emerald-600 hover:bg-emerald-700" disabled={submitPO.isPending}>
                    {submitPO.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit Purchase Order
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
