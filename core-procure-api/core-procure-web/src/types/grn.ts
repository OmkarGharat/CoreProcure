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
  _id: string; // This is the poLineId
  productId: string;
  productName: string;
  uom: string;
  qty: number;
  receivedQty: number;
  rate: number;
}
