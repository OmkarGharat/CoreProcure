import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import GRN from '@/models/GRN';
import PurchaseOrder from '@/models/PurchaseOrder';
import Product from '@/models/Product';
import Series from '@/models/Series';
import StockMovement from '@/models/StockMovement';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const grns = await GRN.find().sort({ createdAt: -1 });

    const enriched = grns.map((grn) => ({
      ...grn.toObject(),
      id: grn._id,
      items: JSON.parse(grn.items),
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

    if (!body.poId || !body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'PO and items are required' }, { status: 400 });
    }

    // Fetch PO
    const po = await PurchaseOrder.findById(body.poId);
    if (!po) return NextResponse.json({ message: 'PO not found' }, { status: 404 });
    if (po.status === 'Closed') return NextResponse.json({ message: 'PO is already closed' }, { status: 400 });

    const poItems = JSON.parse(po.items);

    // Validate GRN quantities
    for (const grnItem of body.items) {
      const poLine = poItems.find((i: any) => i.productId === grnItem.productId);
      if (!poLine) throw new Error(`Product ${grnItem.productId} not found in PO`);
      const pendingQty = poLine.qty - (poLine.receivedQty || 0);
      if (grnItem.acceptedQty > pendingQty) {
        throw new Error(`Cannot accept ${grnItem.acceptedQty} for ${poLine.productName}. Pending: ${pendingQty}`);
      }
    }

    // Moving Average Cost calculation
    const productIds = body.items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const incomingValueMap = new Map();
    body.items.forEach((item: any) => {
      const current = incomingValueMap.get(item.productId) || { totalQty: 0, totalValue: 0 };
      const poLine = poItems.find((i: any) => i.productId === item.productId);
      current.totalQty += item.acceptedQty;
      current.totalValue += item.acceptedQty * poLine.rate;
      incomingValueMap.set(item.productId, current);
    });

    const newMACMap = new Map();
    for (const [productId, incoming] of incomingValueMap) {
      const product = productMap.get(productId);
      const oldTotalValue = (product?.valuationRate || 0) * (product?.stockQty || 0);
      const newTotalValue = oldTotalValue + incoming.totalValue;
      const newTotalQty = (product?.stockQty || 0) + incoming.totalQty;
      const newMAC = newTotalQty === 0 ? 0 : newTotalValue / newTotalQty;
      newMACMap.set(productId, { newMAC, newTotalQty });
    }

    // Generate GRN Number
    const prefix = `GRN-${new Date().getFullYear()}-`;
    let series = await Series.findOne({ name: 'GoodsReceiptNote' });
    if (!series) {
      series = await Series.create({ name: 'GoodsReceiptNote', prefix, currentNumber: 0 });
    }
    const nextNum = series.currentNumber + 1;
    const grnNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
    await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum, prefix });

    // Construct GRN items
    const grnItems = body.items.map((item: any) => {
      const poLine = poItems.find((i: any) => i.productId === item.productId);
      return {
        ...item,
        productName: poLine?.productName || '',
        orderedQty: poLine?.qty || 0,
        rate: poLine?.rate || 0,
      };
    });

    // Create GRN
    const grn = await GRN.create({
      grnNumber,
      poId: body.poId,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      status: 'Posted',
      items: JSON.stringify(grnItems),
    });

    // Update products (MAC + stock qty)
    for (const [productId, data] of newMACMap) {
      await Product.findByIdAndUpdate(productId, {
        valuationRate: data.newMAC,
        stockQty: data.newTotalQty,
      });
    }

    // Create stock movements
    for (const item of body.items) {
      const mac = newMACMap.get(item.productId)?.newMAC || 0;
      await StockMovement.create({
        productId: item.productId,
        warehouseId: item.warehouseId || 'WH-MAIN',
        qty: item.acceptedQty,
        valuationRate: mac,
        referenceType: 'GRN',
        referenceId: grn._id,
      });
    }

    // Update PO line items & status
    const updatedPoItems = poItems.map((poLine: any) => {
      const grnItem = body.items.find((i: any) => i.productId === poLine.productId);
      if (grnItem) {
        poLine.receivedQty = (poLine.receivedQty || 0) + grnItem.acceptedQty;
      }
      return poLine;
    });

    const isFullyReceived = updatedPoItems.every((item: any) => item.receivedQty >= item.qty);

    await PurchaseOrder.findByIdAndUpdate(body.poId, {
      status: isFullyReceived ? 'Closed' : 'Partially Received',
      items: JSON.stringify(updatedPoItems),
    });

    return NextResponse.json({
      message: 'GRN Posted Successfully',
      grnNumber,
      grn: { ...grn.toObject(), id: grn._id, items: JSON.parse(grn.items) },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

