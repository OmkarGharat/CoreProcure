import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const showInactive = searchParams.get('showInactive') === 'true';

    const query: any = {};
    if (!showInactive) query.isActive = true;
    if (search) {
      query.$or = [
        { itemCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.itemCode || !body.description || !body.uom) {
      return NextResponse.json({ message: 'Item code, description, and UOM are required' }, { status: 400 });
    }

    const existing = await Product.findOne({ itemCode: body.itemCode });
    if (existing) {
      return NextResponse.json({ message: 'Item code already exists' }, { status: 400 });
    }

    const product = await Product.create({
      itemCode: body.itemCode,
      description: body.description,
      uom: body.uom,
      defaultPurchaseAccount: body.defaultPurchaseAccount || null,
      valuationRate: body.valuationRate || 0,
      stockQty: body.stockQty || 0,
    });

    return NextResponse.json({ ...product.toObject(), id: product._id }, { status: 201 });
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
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        itemCode: data.itemCode,
        description: data.description,
        uom: data.uom,
        defaultPurchaseAccount: data.defaultPurchaseAccount || null,
        valuationRate: data.valuationRate ?? 0,
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ ...product.toObject(), id: product._id });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

