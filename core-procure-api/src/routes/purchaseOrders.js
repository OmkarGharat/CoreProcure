const express = require('express');
const z = require('zod');
const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Series = require('../models/Series');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const poItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive("Qty must be > 0"),
  rate: z.number().nonnegative("Rate cannot be negative"),
});

const createPOSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  items: z.array(poItemSchema).min(1, "At least one item is required"),
});

// GET All POs
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const pos = await PurchaseOrder.find(filter).sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Create Draft PO
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const validation = createPOSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json(validation.error.flatten());

    const { vendorId, items } = validation.data;

    // 1. Fetch Vendor to denormalize name
    const vendor = await Vendor.findById(vendorId).session(session);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // 2. Fetch Products to denormalize name & UOM, and ensure they exist
    const productIds = items.map(i => new mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    
    const enrichedItems = items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product._id,
        productName: product.description || product.itemCode,
        uom: product.uom,
        qty: item.qty,
        rate: item.rate,
      };
    });

    // 3. Get Next PO Number Atomically
    const prefix = `PO-${new Date().getFullYear()}-`;
    const poNumber = await Series.getNextNumber('PurchaseOrder', prefix);

    // 4. Create PO
    const po = await PurchaseOrder.create([{
      poNumber,
      vendorId,
      vendorName: vendor.name,
      items: enrichedItems
    }], { session });

    await session.commitTransaction();
    res.status(201).json(po[0]);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// PUT Submit PO (Locks document)
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'PO not found' });
    if (po.status !== 'Draft') return res.status(400).json({ message: 'Only Draft POs can be submitted' });

    po.status = 'Submitted';
    await po.save();
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
