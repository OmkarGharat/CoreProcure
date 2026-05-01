const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const z = require('zod');
const User = require('../models/User');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Seed Data (In real app, seed via script)
const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: 'admin@erp.local' });
    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({ email: 'admin@erp.local', password: hashedPassword });
      console.log('Admin user seeded');
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
};
seedAdmin();

router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: "Invalid inputs", errors: result.error });

  const { email, password } = result.data;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ _id: user._id, name: user.email, role: user.role, token });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

module.exports = router;
