import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import QualityInspection from '@/models/QualityInspection';
import GRN from '@/models/GRN';
import Series from '@/models/Series';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const qis = await QualityInspection.find().sort({ createdAt: -1 });

    const enriched = qis.map((qi) => ({
      ...qi.toObject(),
      id: qi._id,
      items: JSON.parse(qi.items),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.grnId || !body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'GRN and items are required' }, { status: 400 });
    }

    // Fetch GRN
    const grn = await GRN.findById(body.grnId);
    if (!grn) return NextResponse.json({ message: 'GRN not found' }, { status: 404 });

    // Generate QI Number
    const prefix = `QI-${new Date().getFullYear()}-`;
    let series = await Series.findOne({ name: 'QualityInspection' });
    if (!series) {
      series = await Series.create({ name: 'QualityInspection', prefix, currentNumber: 0 });
    }
    const nextNum = series.currentNumber + 1;
    const qiNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
    await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum, prefix });

    const qi = await QualityInspection.create({
      qiNumber,
      grnId: body.grnId,
      grnNumber: grn.grnNumber,
      vendorId: grn.vendorId,
      vendorName: grn.vendorName,
      status: 'Submitted',
      items: JSON.stringify(body.items),
      inspectedBy: body.inspectedBy,
    });

    // Update GRN status to 'Inspected'
    await GRN.findByIdAndUpdate(body.grnId, { status: 'Inspected' });

    return NextResponse.json({
      message: 'Quality Inspection Submitted Successfully',
      qiNumber,
      qi: { ...qi.toObject(), id: qi._id, items: JSON.parse(qi.items) },
    }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}

