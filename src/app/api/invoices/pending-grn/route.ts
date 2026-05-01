import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import GRN from '@/models/GRN';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Only 'Inspected' GRNs can be invoiced
    const grns = await GRN.find({ status: 'Inspected' }).sort({ createdAt: -1 });

    const enriched = grns.map((grn) => ({
      ...grn.toObject(),
      id: grn._id,
      items: JSON.parse(grn.items),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
