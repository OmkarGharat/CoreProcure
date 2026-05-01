import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import VendorPayment from '@/models/VendorPayment';
import VendorInvoice from '@/models/VendorInvoice';
import Series from '@/models/Series';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const payments = await VendorPayment.find().sort({ createdAt: -1 });

    const enriched = payments.map((p) => ({
      ...p.toObject(),
      id: p._id,
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

    if (!body.invoiceId || !body.amountPaid || !body.paymentMode) {
      return NextResponse.json({ message: 'Invoice, Amount, and Mode are required' }, { status: 400 });
    }

    const invoice = await VendorInvoice.findById(body.invoiceId);
    if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

    // Generate Payment Number
    const prefix = `PAY-${new Date().getFullYear()}-`;
    let series = await Series.findOne({ name: 'VendorPayment' });
    if (!series) {
      series = await Series.create({ name: 'VendorPayment', prefix, currentNumber: 0 });
    }
    const nextNum = series.currentNumber + 1;
    const paymentNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
    await Series.findByIdAndUpdate(series._id, { currentNumber: nextNum, prefix });

    const payment = await VendorPayment.create({
      paymentNumber,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      invoiceId: body.invoiceId,
      amountPaid: body.amountPaid,
      paymentDate: body.paymentDate || new Date(),
      paymentMode: body.paymentMode,
      referenceNumber: body.referenceNumber,
      remarks: body.remarks,
    });

    // Update Invoice balance and status
    const newBalance = invoice.balanceAmount - body.amountPaid;
    let newStatus = invoice.status;
    if (newBalance <= 0) {
      newStatus = 'Paid';
    } else if (newBalance < invoice.grandTotal) {
      newStatus = 'Partially Paid';
    }

    await VendorInvoice.findByIdAndUpdate(body.invoiceId, {
      balanceAmount: Math.max(0, newBalance),
      status: newStatus,
    });

    return NextResponse.json({
      message: 'Payment Recorded Successfully',
      paymentNumber,
      payment: { ...payment.toObject(), id: payment._id },
    }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}

