import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import PurchaseOrder from '@/models/PurchaseOrder';
import Vendor from '@/models/Vendor';
import Product from '@/models/Product';
import Series from '@/models/Series';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 });

    const enriched = pos.map((po) => ({
      ...po.toObject(),
      id: po._id,
      items: JSON.parse(po.items),
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

    if (!body.vendorId || !body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'Vendor and items are required' }, { status: 400 });
    }

    // Fetch vendor
    const vendor = await Vendor.findById(body.vendorId);
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Fetch products
    const productIds = body.items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const enrichedItems = body.items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product._id,
        productName: product.description || product.itemCode,
        uom: product.uom,
        qty: item.qty,
        rate: item.rate,
        receivedQty: 0,
      };
    });

    // Generate PO number
    const prefix = `PO-${new Date().getFullYear()}-`;
    let series = await Series.findOne({ name: 'PurchaseOrder' });
    if (!series) {
      series = await Series.create({ name: 'PurchaseOrder', prefix, currentNumber: 0 });
    }
    const nextNum = series.currentNumber + 1;
    const poNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;

    await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum, prefix });

    const po = await PurchaseOrder.create({
      poNumber,
      vendorId: body.vendorId,
      vendorName: vendor.name,
      status: 'Draft',
      items: JSON.stringify(enrichedItems),
    });

    return NextResponse.json({ ...po.toObject(), id: po._id, items: JSON.parse(po.items) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

