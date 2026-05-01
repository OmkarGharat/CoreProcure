'use client';

import { useState } from 'react';
import { useInvoices } from '@/hooks/useERP';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Receipt, Calendar, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const { data: invoices, isLoading } = useInvoices();

  const filteredInvoices = invoices?.filter((inv) => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.externalInvoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Vendor Invoices</h1>
          <p className="text-sm text-slate-500">Manage supplier bills and outgoing payments</p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search invoices..."
          className="pl-9 border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/50">
                <TableHead className="font-semibold text-slate-600 w-[140px]">Inv Number</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[160px]">Vendor Ref</TableHead>
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[140px]">Date</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right w-[120px]">Amount</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[140px]">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">Loading invoices...</TableCell></TableRow>
              ) : filteredInvoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="w-10 h-10 text-slate-200" />
                      <p className="text-slate-400 font-medium">No invoices found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices?.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50 group transition-colors">
                    <TableCell className="py-4 font-mono font-bold text-emerald-600">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium text-slate-700 truncate">{inv.externalInvoiceNumber}</TableCell>
                    <TableCell className="text-slate-600 truncate">{inv.vendorName}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        inv.status === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-700 border-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5' 
                        : inv.status === 'Partially Paid' 
                        ? 'bg-blue-100 text-blue-700 border-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5'
                        : 'bg-slate-100 text-slate-700 border-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5'
                      }>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 font-bold text-xs">
                        VIEW
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
