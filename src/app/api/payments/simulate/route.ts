import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    // In a real Razorpay integration, this route would verify the razorpay_signature
    // that was sent from the client. For our simulation, we just create the Purchase record.

    const purchase = await prisma.purchase.create({
      data: {
        userId: (session.user as any).id,
        testId: testId,
      }
    });

    return NextResponse.json({ success: true, purchase }, { status: 200 });
  } catch (error) {
    console.error('Payment simulation error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
