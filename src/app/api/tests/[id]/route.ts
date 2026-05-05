import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase() || '';

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const testId = resolvedParams.id;

    await prisma.test.delete({
      where: { id: testId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase() || '';

    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const testId = resolvedParams.id;
    const body = await request.json();
    const { title, description, category, isFree, isPublished, price, originalPrice, durationMinutes, thumbnail, questions } = body;

    // Delete existing questions and recreate them (easiest way to handle updates to nested arrays)
    await prisma.question.deleteMany({
      where: { testId }
    });

    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title,
        description: description || '',
        category: category || 'JKSSB',
        isFree: isFree !== undefined ? isFree : true,
        isPublished: isPublished !== undefined ? isPublished : true,
        price: parseInt(price) || 0,
        originalPrice: parseInt(originalPrice) || 0,
        durationMinutes: parseInt(durationMinutes),
        thumbnail: thumbnail || null,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        }
      }
    });

    return NextResponse.json(updatedTest, { status: 200 });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
  }
}
