'use client';

import { useState } from 'react';
import { useQIs } from '@/hooks/useERP';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ClipboardCheck, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function QualityInspectionPage() {
  const [search, setSearch] = useState('');
  const { data: qis, isLoading } = useQIs();

  const filteredQIs = qis?.filter((qi) => 
    qi.qiNumber.toLowerCase().includes(search.toLowerCase()) ||
    qi.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
    qi.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quality Inspections</h1>
          <p className="text-sm text-slate-500">Inspect and approve received goods</p>
        </div>
        <Link href="/qi/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search inspections..."
          className="pl-9 border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600">QI Number</TableHead>
                <TableHead className="font-semibold text-slate-600">GRN Reference</TableHead>
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">Loading inspections...</TableCell></TableRow>
              ) : filteredQIs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-medium">No inspections found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQIs?.map((qi) => (
                  <TableRow key={qi.id} className="hover:bg-slate-50/50 group">
                    <TableCell className="font-mono font-bold text-emerald-600">{qi.qiNumber}</TableCell>
                    <TableCell className="font-medium text-slate-700">{qi.grnNumber}</TableCell>
                    <TableCell className="text-slate-600">{qi.vendorName}</TableCell>
                    <TableCell className="text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(qi.createdAt), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 border-0">
                        {qi.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 h-8">
                        View
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
