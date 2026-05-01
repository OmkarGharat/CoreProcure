import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Vendor from '@/models/Vendor';
import Product from '@/models/Product';
import PurchaseOrder from '@/models/PurchaseOrder';
import Series from '@/models/Series';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();
    
    // Seed admin user
    const existingUser = await User.findOne({ email: 'admin@erp.local' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        email: 'admin@erp.local',
        password: hashedPassword,
        name: 'Admin',
        role: 'Admin',
      });
    }

    // Check if we already have sample data
    const vendorCount = await Vendor.countDocuments();
    if (vendorCount > 0) {
      return NextResponse.json({ message: 'Data already seeded' });
    }

    // Sample vendors
    const vendors = await Promise.all([
      Vendor.create({ name: 'Steel Dynamics India', gst: '29ABCDE1234F1Z5', currency: 'INR', addresses: JSON.stringify([{ type: 'Shipping', line1: '45 Industrial Area', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }]) }),
      Vendor.create({ name: 'CopperTech Solutions', gst: '27FGHIJ5678K2Z3', currency: 'INR', addresses: JSON.stringify([{ type: 'Shipping', line1: '12 MIDC Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' }]) }),
      Vendor.create({ name: 'National Hardware Co.', gst: '07KLMNO9012L3Z7', currency: 'INR', addresses: JSON.stringify([{ type: 'Shipping', line1: '78 GT Road', city: 'Delhi', state: 'Delhi', pincode: '110001' }]) }),
      Vendor.create({ name: 'Southern Electricals Ltd', gst: '33PQRST3456M4Z1', currency: 'INR', addresses: JSON.stringify([{ type: 'Shipping', line1: '23 Mount Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' }]) }),
    ]);

    // Sample products
    const products = await Promise.all([
      Product.create({ itemCode: 'STL-BOLT-M10', description: 'Steel Bolts M10 x 25mm', uom: 'Nos', valuationRate: 15.50 }),
      Product.create({ itemCode: 'CPR-WIRE-2MM', description: 'Copper Wire 2mm Diameter', uom: 'Mtr', valuationRate: 45.00 }),
      Product.create({ itemCode: 'ELB-CB-3C', description: 'Electrical Cable 3 Core 2.5mm', uom: 'Mtr', valuationRate: 82.00 }),
      Product.create({ itemCode: 'HDW-ANGLE-50', description: 'MS Angle 50x50x5mm', uom: 'Kg', valuationRate: 62.00 }),
      Product.create({ itemCode: 'MEC-BRG-6205', description: 'Ball Bearing 6205-2RS', uom: 'Nos', valuationRate: 280.00 }),
      Product.create({ itemCode: 'PLB-PIPE-25', description: 'PVC Pipe 25mm DI', uom: 'Mtr', valuationRate: 35.00 }),
    ]);

    // Create series for PO
    await Series.findOneAndUpdate(
      { name: 'PurchaseOrder' },
      { $setOnInsert: { name: 'PurchaseOrder', prefix: 'PO-2026-', currentNumber: 0 } },
      { upsert: true, new: true }
    );

    // Sample POs
    await PurchaseOrder.create({
      poNumber: 'PO-2026-00001',
      vendorId: vendors[0]._id,
      vendorName: vendors[0].name,
      status: 'Submitted',
      items: JSON.stringify([
        { productId: products[0]._id, productName: products[0].description, uom: products[0].uom, qty: 500, rate: 15.50, receivedQty: 0 },
        { productId: products[3]._id, productName: products[3].description, uom: products[3].uom, qty: 200, rate: 62.00, receivedQty: 0 },
      ]),
    });

    await PurchaseOrder.create({
      poNumber: 'PO-2026-00002',
      vendorId: vendors[1]._id,
      vendorName: vendors[1].name,
      status: 'Draft',
      items: JSON.stringify([
        { productId: products[1]._id, productName: products[1].description, uom: products[1].uom, qty: 100, rate: 45.00, receivedQty: 0 },
        { productId: products[2]._id, productName: products[2].description, uom: products[2].uom, qty: 300, rate: 82.00, receivedQty: 0 },
      ]),
    });

    // Update series counter
    await Series.updateOne({ name: 'PurchaseOrder' }, { currentNumber: 2 });

    return NextResponse.json({ message: 'Sample data seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

