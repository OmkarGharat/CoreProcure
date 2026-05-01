import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

// Pre-hashed password for 'admin123' - avoids slow bcrypt.hash on every call
const ADMIN_EMAIL = 'admin@erp.local';
const PRE_HASHED_PASSWORD = '$2b$10$H7Ee15192v0PxQW.OdQBj..WYBWmZewn9B62i34QQnLGsMrGcvYq.';

export async function POST() {
  try {
    await dbConnect();
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (!existing) {
      await User.create({
        email: ADMIN_EMAIL,
        password: PRE_HASHED_PASSWORD,
        name: 'Admin',
        role: 'Admin',
      });
      return NextResponse.json({ message: 'Admin user seeded' });
    }
    return NextResponse.json({ message: 'Admin user already exists' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

