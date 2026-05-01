import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Series from '@/models/Series';
import { handleApiError } from '@/lib/error-handler';


const validateField = (val: string) => {

  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
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
    if (search) {
      query.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } }, // Backward compatibility
        { productNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Backfill missing product numbers and product codes
    const enriched = await Promise.all(products.map(async (p) => {
      const obj = p.toObject() as any;
      let needsUpdate = false;
      const updateData: any = {};

      if (!obj.productNumber) {
        let series = await Series.findOne({ name: 'ProductNumber' });
        if (!series) {
          series = await Series.create({ name: 'ProductNumber', prefix: 'P', currentNumber: 10000 });
        }
        const nextNum = series.currentNumber + 1;
        const newNum = `${series.prefix}${nextNum}`;
        await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum });
        updateData.productNumber = newNum;
        obj.productNumber = newNum;
        needsUpdate = true;
      }

      if (!obj.productCode && obj.itemCode) {
        updateData.productCode = obj.itemCode;
        obj.productCode = obj.itemCode;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(p._id, updateData);
      }

      return { ...obj, id: p._id };
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

    const pCode = body.productCode || body.itemCode;

    if (!validateField(pCode) || !validateField(body.description) || !body.uom) {
      return NextResponse.json({ 
        message: 'Product code, description, and UOM are required and must contain alphanumeric characters' 
      }, { status: 400 });
    }

    const existing = await Product.findOne({ 
      $or: [{ productCode: pCode.trim() }, { itemCode: pCode.trim() }] 
    });
    if (existing) {
      return NextResponse.json({ message: 'Product code already exists' }, { status: 400 });
    }

    // Handle Product Number generation
    let productNumber = body.productNumber;
    if (!productNumber) {
      let series = await Series.findOne({ name: 'ProductNumber' });
      if (!series) {
        series = await Series.create({ name: 'ProductNumber', prefix: 'P', currentNumber: 10000 });
      }
      const nextNum = series.currentNumber + 1;
      productNumber = `${series.prefix}${nextNum}`;
      await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum });
    }

    const product = await Product.create({
      productNumber,
      productCode: pCode.trim(),
      description: body.description.trim(),
      uom: body.uom,
      defaultPurchaseAccount: body.defaultPurchaseAccount || null,
      valuationRate: body.valuationRate || 0,
      stockQty: body.stockQty || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ ...product.toObject(), id: product._id }, { status: 201 });
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
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const pCode = data.productCode || data.itemCode;

    if (pCode !== undefined && !validateField(pCode)) {
      return NextResponse.json({ message: 'Product code must contain alphanumeric characters' }, { status: 400 });
    }
    if (data.description !== undefined && !validateField(data.description)) {
      return NextResponse.json({ message: 'Description must contain alphanumeric characters' }, { status: 400 });
    }

    const updateData: any = { ...data };
    if (pCode) {
      updateData.productCode = pCode.trim();
      delete updateData.itemCode;
    }
    if (data.description) updateData.description = data.description.trim();

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ ...product.toObject(), id: product._id });
  } catch (error: any) {
    return handleApiError(error);
  }
}




