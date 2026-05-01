import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import VendorInvoice from '@/models/VendorInvoice';
import GRN from '@/models/GRN';
import Series from '@/models/Series';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const invoices = await VendorInvoice.find().sort({ createdAt: -1 });

    const enriched = invoices.map((inv) => ({
      ...inv.toObject(),
      id: inv._id,
      items: JSON.parse(inv.items),
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

    if (!body.grnId || !body.externalInvoiceNumber) {
      return NextResponse.json({ message: 'GRN and External Invoice Number are required' }, { status: 400 });
    }

    const grn = await GRN.findById(body.grnId);
    if (!grn) return NextResponse.json({ message: 'GRN not found' }, { status: 404 });

    // Generate Internal Invoice Number
    const prefix = `INV-${new Date().getFullYear()}-`;
    let series = await Series.findOne({ name: 'VendorInvoice' });
    if (!series) {
      series = await Series.create({ name: 'VendorInvoice', prefix, currentNumber: 0 });
    }
    const nextNum = series.currentNumber + 1;
    const invoiceNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
    await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum, prefix });

    const invoice = await VendorInvoice.create({
      invoiceNumber,
      externalInvoiceNumber: body.externalInvoiceNumber,
      grnId: body.grnId,
      qiId: body.qiId,
      vendorId: grn.vendorId,
      vendorName: grn.vendorName,
      status: 'Submitted',
      totalAmount: body.totalAmount,
      taxAmount: body.taxAmount || 0,
      grandTotal: body.grandTotal,
      balanceAmount: body.grandTotal,
      dueDate: body.dueDate,
      items: JSON.stringify(body.items || []),
    });

    // Update GRN status to 'Invoiced'
    await GRN.findByIdAndUpdate(body.grnId, { status: 'Invoiced' });

    return NextResponse.json({
      message: 'Vendor Invoice Created Successfully',
      invoiceNumber,
      invoice: { ...invoice.toObject(), id: invoice._id, items: JSON.parse(invoice.items) },
    }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}

