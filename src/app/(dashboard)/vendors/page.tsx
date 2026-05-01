export const dynamic = 'force-dynamic';

'use client';

import { useState } from 'react';
import { useVendors, useCreateVendor, useUpdateVendor } from '@/hooks/useERP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building2, MapPin, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Vendor } from '@/types/erp';

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: '', gst: '', city: '', state: '', pincode: '' });

  const { data: vendors, isLoading } = useVendors(search);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const openCreate = () => {
    setEditVendor(null);
    setForm({ name: '', gst: '', city: '', state: '', pincode: '' });
    setOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditVendor(vendor);
    setForm({
      name: vendor.name,
      gst: vendor.gst || '',
      city: vendor.addresses?.[0]?.city || '',
      state: vendor.addresses?.[0]?.state || '',
      pincode: vendor.addresses?.[0]?.pincode || '',
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      gst: form.gst || undefined,
      addresses: form.city ? [{ type: 'Shipping' as const, line1: '', city: form.city, state: form.state, pincode: form.pincode }] : [],
    };

    if (editVendor) {
      updateVendor.mutate({ id: editVendor.id, ...payload }, {
        onSuccess: () => {
          toast.success('Vendor updated successfully');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update vendor'),
      });
    } else {
      createVendor.mutate(payload, {
        onSuccess: () => {
          toast.success('Vendor created successfully');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create vendor'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Manage your supplier database</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editVendor ? 'Edit Vendor' : 'Create New Vendor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter vendor name" />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="e.g. 29ABCDE1234F1Z5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createVendor.isPending || updateVendor.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  {(createVendor.isPending || updateVendor.isPending) ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : editVendor ? 'Update Vendor' : 'Create Vendor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search vendors..."
          className="pl-9 border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead className="font-semibold text-slate-600">Vendor</TableHead>
                <TableHead className="font-semibold text-slate-600">GST Number</TableHead>
                <TableHead className="font-semibold text-slate-600">Location</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400">Loading vendors...</TableCell></TableRow>
              ) : vendors?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 font-medium">No vendors found</p>
                      <p className="text-slate-300 text-sm">Create your first vendor to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vendors?.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50/50 cursor-pointer group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{v.name}</p>
                          <p className="text-xs text-slate-400">{v.currency}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-500">{v.gst || '—'}</TableCell>
                    <TableCell>
                      {v.addresses?.[0]?.city ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {v.addresses[0].city}, {v.addresses[0].state}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${v.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'} border-0 text-xs`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => openEdit(v)}>
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
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
