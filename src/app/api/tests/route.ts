import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        questions: true
      }
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, isFree, price, originalPrice, durationMinutes, thumbnail, questions } = body;

    if (!title || !durationMinutes || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const test = await prisma.test.create({
      data: {
        title,
        description: description || '',
        category: category || 'JKSSB',
        isFree: isFree !== undefined ? isFree : true,
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

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
  }
}
