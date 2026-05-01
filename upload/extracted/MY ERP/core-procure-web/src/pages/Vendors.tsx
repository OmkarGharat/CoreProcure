import { useState } from 'react';
import { useVendors, useCreateVendor } from '../hooks/useVendors';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { FormEvent } from 'react';

export default function Vendors() {
  const [search, setSearch] = useState('');
  const { data: vendors, isLoading } = useVendors(search);
  const createVendor = useCreateVendor();
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', gst: '', city: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createVendor.mutate({
      name: form.name,
      gst: form.gst,
      addresses: [{ type: 'Shipping', line1: '', city: form.city, state: '', pincode: '' }]
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: '', gst: '', city: '' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vendor Master</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Add New Vendor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Vendor</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor Name</label>
                <Input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GST Number</label>
                <Input value={form.gst} onChange={(e) => setForm({...form, gst: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={createVendor.isPending}>
                {createVendor.isPending ? 'Saving...' : 'Save Vendor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white p-4">
        <Input 
          placeholder="Search vendors..." 
          className="max-w-sm mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>City</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : vendors?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No vendors found</TableCell></TableRow>
            ) : (
              vendors?.map((v) => (
                <TableRow key={v._id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.gst || '-'}</TableCell>
                  <TableCell>{v.addresses[0]?.city || '-'}</TableCell>
                  <TableCell className="text-right">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
