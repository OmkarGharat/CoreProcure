import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Vendor from '@/models/Vendor';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const showInactive = searchParams.get('showInactive') === 'true';

    const query: any = {};
    if (!showInactive) query.isActive = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    const enriched = vendors.map((v) => ({
      ...v.toObject(),
      id: v._id,
      addresses: JSON.parse(v.addresses),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ message: 'Vendor name is required' }, { status: 400 });
    }

    const vendor = await Vendor.create({
      name: body.name,
      gst: body.gst || null,
      currency: body.currency || 'INR',
      paymentTerms: body.paymentTerms || null,
      addresses: JSON.stringify(body.addresses || []),
    });

    return NextResponse.json({ ...vendor.toObject(), id: vendor._id, addresses: JSON.parse(vendor.addresses) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: 'Vendor ID is required' }, { status: 400 });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        name: data.name,
        gst: data.gst || null,
        currency: data.currency || 'INR',
        paymentTerms: data.paymentTerms || null,
        addresses: JSON.stringify(data.addresses || []),
      },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ ...vendor.toObject(), id: vendor._id, addresses: JSON.parse(vendor.addresses) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

