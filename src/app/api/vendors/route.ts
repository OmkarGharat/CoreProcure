import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Vendor from '@/models/Vendor';

const validateName = (name: string) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length === 0) return false;
  // Check if it contains at least one alphanumeric character
  return /[a-zA-Z0-9]/.test(trimmed);
};

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

    if (!validateName(body.name)) {
      return NextResponse.json({ 
        message: 'Vendor name is required and must contain alphanumeric characters' 
      }, { status: 400 });
    }

    const vendor = await Vendor.create({
      name: body.name.trim(),
      gst: body.gst?.trim() || null,
      currency: body.currency || 'INR',
      paymentTerms: body.paymentTerms || null,
      addresses: JSON.stringify(body.addresses || []),
      isActive: body.isActive !== undefined ? body.isActive : true,
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

    if (data.name !== undefined && !validateName(data.name)) {
      return NextResponse.json({ 
        message: 'Vendor name must contain alphanumeric characters' 
      }, { status: 400 });
    }

    const updateData: any = { ...data };
    if (data.name) updateData.name = data.name.trim();
    if (data.gst) updateData.gst = data.gst.trim();
    if (data.addresses) updateData.addresses = JSON.stringify(data.addresses);

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ ...vendor.toObject(), id: vendor._id, addresses: JSON.parse(vendor.addresses) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


