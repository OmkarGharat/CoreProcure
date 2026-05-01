import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalVendors, totalProducts, totalPOs, totalGRNs, pos] = await Promise.all([
      db.vendor.count({ where: { isActive: true } }),
      db.product.count({ where: { isActive: true } }),
      db.purchaseOrder.count(),
      db.gRN.count(),
      db.purchaseOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);

    const pendingPOs = pos.filter((po) => po.status === 'Draft' || po.status === 'Submitted').length;
    const partiallyReceived = pos.filter((po) => po.status === 'Partially Received').length;

    // Calculate total PO value
    let totalPOValue = 0;
    const recentPOs = pos.slice(0, 10).map((po) => {
      const items = JSON.parse(po.items);
      const total = items.reduce((sum: number, item: any) => sum + item.qty * item.rate, 0);
      totalPOValue += total;
      return { ...po, items, total };
    });

    // Stock value
    const products = await db.product.findMany({ where: { isActive: true } });
    const totalStockValue = products.reduce((sum, p) => sum + (p.stockQty * p.valuationRate), 0);

    // Recent GRNs
    const recentGRNs = await db.gRN.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const enrichedGRNs = recentGRNs.map((grn) => ({
      ...grn,
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
