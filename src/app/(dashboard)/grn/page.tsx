export const dynamic = 'force-dynamic';

'use client';

import { useState } from 'react';
import { useGRNs } from '@/hooks/useERP';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Boxes, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GRNListPage() {
  const { data: grns, isLoading } = useGRNs();
  const [viewGRN, setViewGRN] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Track goods receipts against purchase orders</p>
        </div>
        <Link href="/grn/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Goods Receipt
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600">GRN Number</TableHead>
                <TableHead className="font-semibold text-slate-600">Purchase Order</TableHead>
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600">Items</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">Loading goods receipts...</TableCell></TableRow>
              ) : grns?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Boxes className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-medium">No goods receipts found</p>
                      <p className="text-slate-300 text-sm">Post your first GRN against a submitted PO</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                grns?.map((grn) => (
                  <TableRow key={grn.id} className="hover:bg-slate-50/50 group">
                    <TableCell>
                      <span className="font-mono font-semibold text-emerald-600">{grn.grnNumber}</span>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-sm">
                      {grn.poId ? `PO-...${grn.poId.slice(-6)}` : '—'}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{grn.vendorName}</TableCell>
                    <TableCell className="text-slate-500">{grn.items.length} items</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(grn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${grn.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} border-0 text-xs font-medium`}>
                        {grn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setViewGRN(grn)}>
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View GRN Dialog */}
      <Dialog open={!!viewGRN} onOpenChange={() => setViewGRN(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="font-mono text-emerald-600">{viewGRN?.grnNumber}</span>
              {viewGRN && (
                <Badge className={`${viewGRN.status === 'Posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} border-0 text-xs`}>
                  {viewGRN.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewGRN && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Vendor:</span> <span className="font-medium ml-2">{viewGRN.vendorName}</span></div>
                <div><span className="text-slate-400">Date:</span> <span className="font-medium ml-2">{new Date(viewGRN.createdAt).toLocaleDateString('en-IN')}</span></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Accepted</TableHead>
                    <TableHead className="text-right">Rejected</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewGRN.items.map((item: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.orderedQty}</TableCell>
                      <TableCell className="text-right">{item.receivedQty}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">{item.acceptedQty}</TableCell>
                      <TableCell className="text-right text-red-500">{item.rejectedQty}</TableCell>
                      <TableCell className="text-right">₹{item.rate?.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
