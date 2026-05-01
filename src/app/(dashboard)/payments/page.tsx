'use client';

import { useState } from 'react';
import { usePayments } from '@/hooks/useERP';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, CreditCard, Calendar, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const { data: payments, isLoading } = usePayments();

  const filteredPayments = payments?.filter((p) => 
    p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    p.referenceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Vendor Payments</h1>
          <p className="text-sm text-slate-500">Track and record outgoing supplier payments</p>
        </div>
        <Link href="/payments/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Payment
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search payments..."
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
                <TableHead className="font-semibold text-slate-600 w-[140px]">Payment ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[140px]">Date</TableHead>
                <TableHead className="font-semibold text-slate-600 w-[120px]">Mode</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right w-[140px]">Amount</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">Loading payments...</TableCell></TableRow>
              ) : filteredPayments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-10 h-10 text-slate-200" />
                      <p className="text-slate-400 font-medium">No payments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments?.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                    <TableCell className="py-4 font-mono font-bold text-emerald-600">{p.paymentNumber}</TableCell>
                    <TableCell className="font-medium text-slate-700 truncate">{p.vendorName}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(p.paymentDate), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-slate-200">
                        {p.paymentMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      ₹{p.amountPaid.toLocaleString('en-IN')}
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
