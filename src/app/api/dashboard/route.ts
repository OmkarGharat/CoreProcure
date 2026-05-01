import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Vendor from '@/models/Vendor';
import Product from '@/models/Product';
import PurchaseOrder from '@/models/PurchaseOrder';
import GRN from '@/models/GRN';

export async function GET() {
  try {
    await dbConnect();
    const [totalVendors, totalProducts, totalPOs, totalGRNs, pos] = await Promise.all([
      Vendor.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      PurchaseOrder.countDocuments(),
      GRN.countDocuments(),
      PurchaseOrder.find().sort({ createdAt: -1 }).limit(50),
    ]);

    const pendingPOs = pos.filter((po) => po.status === 'Draft' || po.status === 'Submitted').length;
    const partiallyReceived = pos.filter((po) => po.status === 'Partially Received').length;

    // Calculate total PO value
    let totalPOValue = 0;
    const recentPOs = pos.slice(0, 10).map((po) => {
      const items = JSON.parse(po.items);
      const total = items.reduce((sum: number, item: any) => sum + item.qty * item.rate, 0);
      totalPOValue += total;
      return { ...po.toObject(), items, total };
    });

    // Stock value
    const products = await Product.find({ isActive: true });
    const totalStockValue = products.reduce((sum, p) => sum + (p.stockQty * p.valuationRate), 0);

    // Recent GRNs
    const recentGRNs = await GRN.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const enrichedGRNs = recentGRNs.map((grn) => ({
      ...grn.toObject(),
      items: JSON.parse(grn.items),
    }));

    return NextResponse.json({
      stats: {
        totalVendors,
        totalProducts,
        totalPOs,
        totalGRNs,
        pendingPOs,
        partiallyReceived,
        totalPOValue,
        totalStockValue,
      },
      recentPOs,
      recentGRNs: enrichedGRNs,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

