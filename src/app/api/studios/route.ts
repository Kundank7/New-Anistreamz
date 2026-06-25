import { NextResponse } from 'next/server';
import globalDb from '@/lib/db';
import { parseArrayField } from '@/lib/utils';

if (!globalDb) {
  throw new Error('Database connection not initialized');
}
const db = globalDb;

export async function GET() {
  const rows = db.prepare("SELECT DISTINCT studios FROM anime WHERE studios != '' AND studios IS NOT NULL").all() as { studios: string }[];
  const studioSet = new Set<string>();
  for (const row of rows) {
    const parsed = parseArrayField(row.studios);
    parsed.forEach(s => studioSet.add(s));
  }
  const studios = Array.from(studioSet).sort();
  return NextResponse.json(studios);
}
