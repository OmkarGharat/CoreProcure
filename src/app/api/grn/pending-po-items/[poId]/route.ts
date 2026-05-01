import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import PurchaseOrder from '@/models/PurchaseOrder';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  try {
    await dbConnect();
    const { poId } = await params;
    const po = await PurchaseOrder.findById(poId);

    if (!po) {
      return NextResponse.json({ message: 'PO not found' }, { status: 404 });
    }

    const items = JSON.parse(po.items);
    const pendingItems = items.filter((item: any) => item.qty > (item.receivedQty || 0));

    return NextResponse.json({ vendorName: po.vendorName, items: pendingItems });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

