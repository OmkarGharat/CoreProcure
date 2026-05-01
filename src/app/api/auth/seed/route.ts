import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Pre-hashed password for 'admin123' - avoids slow bcrypt.hash on every call
const ADMIN_EMAIL = 'admin@erp.local';
const PRE_HASHED_PASSWORD = '$2b$10$H7Ee15192v0PxQW.OdQBj..WYBWmZewn9B62i34QQnLGsMrGcvYq.';

export async function POST() {
  try {
    const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!existing) {
      await db.user.create({
        data: { email: ADMIN_EMAIL, password: PRE_HASHED_PASSWORD, name: 'Admin', role: 'Admin' },
      });
      return NextResponse.json({ message: 'Admin user seeded' });
    }
    return NextResponse.json({ message: 'Admin user already exists' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
