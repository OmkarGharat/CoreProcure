import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import PurchaseOrder from '@/models/PurchaseOrder';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const po = await PurchaseOrder.findById(id);

    if (!po) {
      return NextResponse.json({ message: 'PO not found' }, { status: 404 });
    }

    if (po.status !== 'Draft') {
      return NextResponse.json({ message: 'Only Draft POs can be submitted' }, { status: 400 });
    }

    const updated = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status: 'Submitted' },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update PO' }, { status: 500 });
    }

    return NextResponse.json({ ...updated.toObject(), id: updated._id, items: JSON.parse(updated.items) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

