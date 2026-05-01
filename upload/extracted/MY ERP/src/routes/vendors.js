const express = require('express');
const z = require('zod');
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/authMiddleware');
const { getActiveFilter } = require('../utils/helpers');

const router = express.Router();

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  gst: z.string().optional(),
  currency: z.string().default('INR'),
  paymentTerms: z.string().optional(),
  addresses: z.array(z.object({
    type: z.enum(['Billing', 'Shipping']),
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string()
  })).optional()
});

router.get('/', protect, async (req, res) => {
  try {
    const { search, showInactive } = req.query;
    let filter = getActiveFilter(showInactive === 'true');
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const validation = vendorSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json(validation.error.flatten());

    const vendor = await Vendor.create(validation.data);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const validation = vendorSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json(validation.error.flatten());

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, validation.data, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Soft Delete endpoint (NO ACTUAL DELETE)
router.patch('/:id/deactivate', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, 
      { isActive: false, deletedAt: new Date() }, 
      { new: true }
    );
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
