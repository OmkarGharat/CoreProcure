import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const po = await db.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      return NextResponse.json({ message: 'PO not found' }, { status: 404 });
    }

    const parsedItems = JSON.parse(po.items);
    if (po.status !== 'Draft') {
      return NextResponse.json({ message: 'Only Draft POs can be submitted' }, { status: 400 });
    }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: { status: 'Submitted' },
    });

    return NextResponse.json({ ...updated, items: JSON.parse(updated.items) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
