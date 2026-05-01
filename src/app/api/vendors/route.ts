import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Vendor from '@/models/Vendor';
import Series from '@/models/Series';
import { handleApiError } from '@/lib/error-handler';


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

    // Handle backfilling missing vendor codes
    const enriched = await Promise.all(vendors.map(async (v) => {
      const obj = v.toObject();
      if (!obj.vendorCode) {
        let series = await Series.findOne({ name: 'VendorCode' });
        if (!series) {
          series = await Series.create({ name: 'VendorCode', prefix: '', currentNumber: 10000 });
        }
        const nextNum = series.currentNumber + 1;
        const newCode = `${series.prefix}${nextNum}`;
        await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum });
        await Vendor.findByIdAndUpdate(v._id, { vendorCode: newCode });
        obj.vendorCode = newCode;
      }
      return {
        ...obj,
        id: v._id,
        addresses: JSON.parse(v.addresses),
      };
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

    if (!validateName(body.name)) {
      return NextResponse.json({ 
        message: 'Vendor name is required and must contain alphanumeric characters' 
      }, { status: 400 });
    }

    // Handle Vendor Code generation
    let vendorCode = body.vendorCode;
    if (!vendorCode) {
      let series = await Series.findOne({ name: 'VendorCode' });
      if (!series) {
        series = await Series.create({ name: 'VendorCode', prefix: '', currentNumber: 10000 });
      }
      const nextNum = series.currentNumber + 1;
      vendorCode = `${series.prefix}${nextNum}`;
      await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum });
    }

    const vendor = await Vendor.create({
      name: body.name.trim(),
      vendorCode: vendorCode.toString().trim(),
      gst: body.gst?.trim() || null,
      currency: body.currency || 'INR',
      paymentTerms: body.paymentTerms || null,
      addresses: JSON.stringify(body.addresses || []),
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ ...vendor.toObject(), id: vendor._id, addresses: JSON.parse(vendor.addresses) }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
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
    if (data.vendorCode) updateData.vendorCode = data.vendorCode.toString().trim();
    if (data.gst) updateData.gst = data.gst.trim();
    if (data.addresses) updateData.addresses = JSON.stringify(data.addresses);

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ ...vendor.toObject(), id: vendor._id, addresses: JSON.parse(vendor.addresses) });
  } catch (error: any) {
    return handleApiError(error);
  }
}




