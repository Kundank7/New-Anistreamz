import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    revalidatePath('/');
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
