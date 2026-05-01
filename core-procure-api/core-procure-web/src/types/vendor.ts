export interface VendorAddress {
  type: 'Billing' | 'Shipping';
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Vendor {
  _id: string;
  name: string;
  gst?: string;
  currency: string;
  paymentTerms?: string;
  addresses: VendorAddress[];
  isActive: boolean;
}
