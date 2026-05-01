import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const showInactive = searchParams.get('showInactive') === 'true';

    const where: any = {};
    if (!showInactive) where.isActive = true;
    if (search) where.name = { contains: search };

    const vendors = await db.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = vendors.map((v) => ({
      ...v,
      addresses: JSON.parse(v.addresses),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ message: 'Vendor name is required' }, { status: 400 });
    }

    const vendor = await db.vendor.create({
      data: {
        name: body.name,
        gst: body.gst || null,
        currency: body.currency || 'INR',
        paymentTerms: body.paymentTerms || null,
        addresses: JSON.stringify(body.addresses || []),
      },
    });

    return NextResponse.json({ ...vendor, addresses: JSON.parse(vendor.addresses) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: 'Vendor ID is required' }, { status: 400 });
    }

    const vendor = await db.vendor.update({
      where: { id },
      data: {
        name: data.name,
        gst: data.gst || null,
        currency: data.currency || 'INR',
        paymentTerms: data.paymentTerms || null,
        addresses: JSON.stringify(data.addresses || []),
      },
    });

    return NextResponse.json({ ...vendor, addresses: JSON.parse(vendor.addresses) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
