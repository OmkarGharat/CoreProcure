import { Link } from 'react-router-dom';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const statusColorMap: Record<string, string> = {
  Draft: 'bg-gray-200 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  'Partially Received': 'bg-orange-100 text-orange-800',
  Closed: 'bg-green-100 text-green-800',
};

export default function PurchaseOrders() {
  const { data: pos, isLoading } = usePurchaseOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <Link to="/purchase-orders/new">
          <Button>+ New Purchase Order</Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-white p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : (
              pos?.map((po) => {
                const total = po.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
                return (
                  <TableRow key={po._id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-mono font-medium text-blue-600">{po.poNumber}</TableCell>
                    <TableCell>{po.vendorName}</TableCell>
                    <TableCell className="text-gray-500">{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColorMap[po.status]} border-0`}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
