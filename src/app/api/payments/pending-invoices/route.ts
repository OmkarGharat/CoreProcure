import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import VendorInvoice from '@/models/VendorInvoice';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Fetch invoices with a balance > 0
    const invoices = await VendorInvoice.find({ balanceAmount: { $gt: 0 } }).sort({ createdAt: -1 });

    const enriched = invoices.map((inv) => ({
      ...inv.toObject(),
      id: inv._id,
      items: JSON.parse(inv.items),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
