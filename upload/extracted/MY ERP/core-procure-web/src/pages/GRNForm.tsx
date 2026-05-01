import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { usePendingPOItems, useCreateGRN } from '../hooks/useGRN';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { GRNItem } from '../types/grn';

export default function GRNForm() {
  const navigate = useNavigate();
  const [selectedPO, setSelectedPO] = useState<string | undefined>(undefined);
  // Fetch Submitted AND Partially Received POs — both can have GRNs posted against them
  const { data: pos } = usePurchaseOrders();
  const { data: poDetails, isLoading: loadingItems } = usePendingPOItems(selectedPO);
  const createGRN = useCreateGRN();

  const [items, setItems] = useState<GRNItem[]>([]);
  const [error, setError] = useState('');

  // When PO Details load, initialize the GRN items state
  useEffect(() => {
    if (poDetails?.items) {
      setItems(poDetails.items.map(poItem => ({
        poLineId: poItem._id,
        productId: poItem.productId,
        productName: poItem.productName,
        orderedQty: poItem.qty,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        rate: poItem.rate,
        warehouseId: 'WH-MAIN' // Hardcoded for MVP
      })));
    } else {
      setItems([]);
    }
  }, [poDetails]);

  const handleReceivedChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].receivedQty = value;
    newItems[index].acceptedQty = value; // Assume 100% acceptance by default
    newItems[index].rejectedQty = 0;
    setItems(newItems);
    setError('');
  };

  const handleAcceptedChange = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].acceptedQty = value;
    newItems[index].rejectedQty = newItems[index].receivedQty - value;
    setItems(newItems);
  };

  const handlePostGRN = () => {
    // Validation
    const hasInvalidQty = items.some(i => i.acceptedQty < 0 || i.rejectedQty < 0 || i.acceptedQty > i.receivedQty);
    if (hasInvalidQty) return setError("Invalid quantities. Accepted cannot exceed Received.");
    if (items.length > 0 && items.every(i => i.receivedQty === 0)) return setError("Please enter received quantities.");

    createGRN.mutate({
      poId: selectedPO!,
      items: items.map(({ poLineId, productId, receivedQty, acceptedQty, rejectedQty, rate, warehouseId }) => ({
        poLineId, productId, receivedQty, acceptedQty, rejectedQty, rate, warehouseId
      }))
    }, {
      onSuccess: () => navigate('/grn')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold">New Goods Receipt Note</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/grn')}>Cancel</Button>
          <Button onClick={handlePostGRN} disabled={createGRN.isPending || !selectedPO || items.length === 0}>
            {createGRN.isPending ? 'Posting...' : 'Post GRN'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full max-w-md border rounded-md px-3 py-2"
            value={selectedPO}
            onChange={(e) => setSelectedPO(e.target.value || undefined)}
          >
            <option value="">-- Select Submitted PO --</option>
            {pos?.filter(po => po.status === 'Submitted' || po.status === 'Partially Received').map(po => (
              <option key={po._id} value={po._id}>{po.poNumber} - {po.vendorName}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {error && <p className="text-red-600 font-medium bg-red-50 p-3 rounded">{error}</p>}

      {loadingItems && <p className="text-gray-500">Loading items...</p>}

      {!loadingItems && items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Receipt Details (Vendor: {poDetails?.vendorName})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Accepted</TableHead>
                  <TableHead>Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const poItem = poDetails?.items.find(i => i._id === item.poLineId);
                  const pending = poItem ? (poItem.qty - poItem.receivedQty) : 0;
                  return (
                    <TableRow key={item.poLineId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.orderedQty}</TableCell>
                      <TableCell className="text-orange-600 font-medium">{pending}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.receivedQty || ''}
                          onChange={(e) => handleReceivedChange(index, Number(e.target.value))}
                          max={pending}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.acceptedQty || ''}
                          onChange={(e) => handleAcceptedChange(index, Number(e.target.value))}
                          max={item.receivedQty}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.rejectedQty}
                          disabled
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
