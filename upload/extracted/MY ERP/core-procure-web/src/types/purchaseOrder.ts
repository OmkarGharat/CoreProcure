export interface POItem {
  _id?: string;
  productId: string;
  productName: string;
  uom: string;
  qty: number;
  rate: number;
  receivedQty: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted' | 'Partially Received' | 'Closed';
  items: POItem[];
  createdAt: string;
}
