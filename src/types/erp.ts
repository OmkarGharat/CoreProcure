export interface VendorAddress {
  type: 'Billing' | 'Shipping';
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Vendor {
  id: string;
  name: string;
  vendorCode: string;

  gst?: string;
  currency: string;
  paymentTerms?: string;
  addresses: VendorAddress[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productNumber: string;
  productCode: string;
  description: string;
  uom: string;
  defaultPurchaseAccount?: string;
  valuationRate: number;
  stockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


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
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted' | 'Partially Received' | 'Closed';
  items: POItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GRNItem {
  poLineId: string;
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rate: number;
  warehouseId: string;
}

export interface PendingPOItem {
  productId: string;
  productName: string;
  uom: string;
  qty: number;
  receivedQty: number;
  rate: number;
}

export interface GRN {
  id: string;
  grnNumber: string;
  poId: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Posted';
  items: GRNItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IQIItem {
  productId: string;
  productName: string;
  receivedQty: number;
  inspectedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  remarks?: string;
}

export interface QualityInspection {
  id: string;
  qiNumber: string;
  grnId: string;
  grnNumber: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted';
  items: IQIItem[];
  inspectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  externalInvoiceNumber: string;
  grnId?: string;
  qiId?: string;
  vendorId: string;
  vendorName: string;
  status: 'Draft' | 'Submitted' | 'Partially Paid' | 'Paid';
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  balanceAmount: number;
  dueDate?: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque';
  referenceNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: {
    totalVendors: number;
    totalProducts: number;
    totalPOs: number;
    totalGRNs: number;
    pendingPOs: number;
    partiallyReceived: number;
    totalPOValue: number;
    totalStockValue: number;
  };
  recentPOs: (PurchaseOrder & { total: number })[];
  recentGRNs: GRN[];
}

