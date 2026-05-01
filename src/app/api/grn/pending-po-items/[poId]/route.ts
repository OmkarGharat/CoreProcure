import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  try {
    const { poId } = await params;
    const po = await db.purchaseOrder.findUnique({ where: { id: poId } });

    if (!po) {
      return NextResponse.json({ message: 'PO not found' }, { status: 404 });
    }

    const items = JSON.parse(po.items);
    const pendingItems = items.filter((item: any) => item.qty > item.receivedQty);

    return NextResponse.json({ vendorName: po.vendorName, items: pendingItems });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
