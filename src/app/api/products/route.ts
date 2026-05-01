import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const showInactive = searchParams.get('showInactive') === 'true';

    const where: any = {};
    if (!showInactive) where.isActive = true;
    if (search) {
      where.OR = [
        { itemCode: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.itemCode || !body.description || !body.uom) {
      return NextResponse.json({ message: 'Item code, description, and UOM are required' }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { itemCode: body.itemCode } });
    if (existing) {
      return NextResponse.json({ message: 'Item code already exists' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        itemCode: body.itemCode,
        description: body.description,
        uom: body.uom,
        defaultPurchaseAccount: body.defaultPurchaseAccount || null,
        valuationRate: body.valuationRate || 0,
        stockQty: body.stockQty || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        itemCode: data.itemCode,
        description: data.description,
        uom: data.uom,
        defaultPurchaseAccount: data.defaultPurchaseAccount || null,
        valuationRate: data.valuationRate ?? 0,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
