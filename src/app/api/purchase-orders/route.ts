import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const pos = await db.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = pos.map((po) => ({
      ...po,
      items: JSON.parse(po.items),
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.vendorId || !body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'Vendor and items are required' }, { status: 400 });
    }

    // Fetch vendor
    const vendor = await db.vendor.findUnique({ where: { id: body.vendorId } });
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Fetch products
    const productIds = body.items.map((i: any) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedItems = body.items.map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product.id,
        productName: product.description || product.itemCode,
        uom: product.uom,
        qty: item.qty,
        rate: item.rate,
        receivedQty: 0,
      };
    });

    // Generate PO number
    const prefix = `PO-${new Date().getFullYear()}-`;
    let series = await db.series.findUnique({ where: { name: 'PurchaseOrder' } });
    if (!series) {
      series = await db.series.create({ data: { name: 'PurchaseOrder', prefix, currentNumber: 0 } });
    }
    const nextNum = series.currentNumber + 1;
    const poNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;

    await db.series.update({ where: { id: series.id }, data: { currentNumber: nextNum, prefix } });

    const po = await db.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: body.vendorId,
        vendorName: vendor.name,
        status: 'Draft',
        items: JSON.stringify(enrichedItems),
      },
    });

    return NextResponse.json({ ...po, items: JSON.parse(po.items) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
