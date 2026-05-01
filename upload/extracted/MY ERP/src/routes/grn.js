const express = require('express');
const z = require('zod');
const mongoose = require('mongoose');
const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Series = require('../models/Series');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const grnItemSchema = z.object({
  poLineId: z.string().min(1),
  productId: z.string().min(1),
  receivedQty: z.number().positive(),
  acceptedQty: z.number().min(0),
  rejectedQty: z.number().min(0),
  warehouseId: z.string().min(1),
}).refine(data => data.receivedQty === data.acceptedQty + data.rejectedQty, {
  message: "Received Qty must equal Accepted + Rejected Qty",
  path: ["acceptedQty"]
});

const createGRNSchema = z.object({
  poId: z.string().min(1),
  items: z.array(grnItemSchema).min(1),
});

// GET Pending PO Items for a specific PO
router.get('/pending-po-items/:poId', protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.poId);
    if (!po) return res.status(404).json({ message: 'PO not found' });
    
    // Filter out lines that are fully received
    const pendingItems = po.items.filter(item => item.qty > item.receivedQty);
    res.json({ vendorName: po.vendorName, items: pendingItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Create & Post GRN (The Atomic Transaction)
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validation = createGRNSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json(validation.error.flatten());

    const { poId, items } = validation.data;

    // 1. Fetch PO and Lock it (read with session)
    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error('Purchase Order not found');
    if (po.status === 'Closed') throw new Error('PO is already closed');

    // 2. Validate GRN Qtys against PO Pending Qtys
    for (const grnItem of items) {
      const poLine = po.items.id(grnItem.poLineId);
      if (!poLine) throw new Error(`PO Line ${grnItem.poLineId} not found`);
      const pendingQty = poLine.qty - poLine.receivedQty;
      if (grnItem.acceptedQty > pendingQty) {
        throw new Error(`Cannot accept ${grnItem.acceptedQty} for ${poLine.productName}. Pending: ${pendingQty}`);
      }
    }

    // 3. PRE-TRANSACTION CALCULATION: Moving Average Cost (MAC)
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Aggregate incoming values by Product ID
    const incomingValueMap = new Map();
    items.forEach(item => {
      const current = incomingValueMap.get(item.productId) || { totalQty: 0, totalValue: 0 };
      // Use PO rate for valuation
      const poLine = po.items.id(item.poLineId);
      current.totalQty += item.acceptedQty;
      current.totalValue += (item.acceptedQty * poLine.rate);
      incomingValueMap.set(item.productId, current);
    });

    // Calculate new MACs
    const newMACMap = new Map();
    for (const [productId, incoming] of incomingValueMap) {
      const product = productMap.get(productId);
      const oldTotalValue = product.valuationRate * (product.stockQty || 0); // Assuming you add stockQty to Product, else fetch from StockMovements
      const newTotalValue = oldTotalValue + incoming.totalValue;
      const newTotalQty = (product.stockQty || 0) + incoming.totalQty;
      
      const newMAC = newTotalQty === 0 ? 0 : newTotalValue / newTotalQty;
      newMACMap.set(productId, { newMAC, newTotalQty });
    }

    // 4. Generate GRN Number
    const prefix = `GRN-${new Date().getFullYear()}-`;
    const grnNumber = await Series.getNextNumber('GoodsReceiptNote', prefix);

    // 5. Construct GRN Document
    const grnItems = items.map(item => {
      const poLine = po.items.id(item.poLineId);
      return {
        ...item,
        productName: poLine.productName,
        orderedQty: poLine.qty,
        rate: poLine.rate
      };
    });

    const grnData = {
      grnNumber,
      poId,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      status: 'Posted',
      items: grnItems
    };

    // 6. EXECUTE TRANSACTION WRITES
    await GRN.create([grnData], { session });

    // 6a. Update Product Master (MAC & Stock Qty)
    const productUpdates = [];
    for (const [productId, data] of newMACMap) {
      productUpdates.push({
        updateOne: {
          filter: { _id: productId },
          update: { $set: { valuationRate: data.newMAC, stockQty: data.newTotalQty } }
        }
      });
    }
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates, { session });
    }

    // 6b. Create Stock Movements
    const stockMovements = items.map(item => {
      const mac = newMACMap.get(item.productId).newMAC;
      return {
        productId: item.productId,
        warehouseId: item.warehouseId,
        qty: item.acceptedQty, // Positive for Inward
        valuationRate: mac,
        referenceType: 'GRN',
        referenceId: poId // Will be replaced with actual GRN ID if needed, but PO ID is fine for trace
      };
    });
    await StockMovement.insertMany(stockMovements, { session });

    // 6c. Update Purchase Order Line Items & Status
    const poUpdateOps = items.map(item => ({
      updateOne: {
        filter: { _id: poId, "items._id": item.poLineId },
        update: { $inc: { "items.$.receivedQty": item.acceptedQty } }
      }
    }));

    // Determine new PO Status in memory
    // Reconstruct PO items state to check if fully received
    let isFullyReceived = true;
    po.items.forEach(poLine => {
      const grnItem = items.find(i => i.poLineId === poLine._id.toString());
      const newReceived = poLine.receivedQty + (grnItem ? grnItem.acceptedQty : 0);
      if (newReceived < poLine.qty) isFullyReceived = false;
    });

    poUpdateOps.push({
      updateOne: {
        filter: { _id: poId },
        update: { $set: { status: isFullyReceived ? 'Closed' : 'Partially Received' } }
      }
    });

    await PurchaseOrder.bulkWrite(poUpdateOps, { session });

    // 7. Commit
    await session.commitTransaction();
    res.status(201).json({ message: "GRN Posted Successfully", grnNumber });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
