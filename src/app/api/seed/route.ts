import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Only allow seeding if tests are empty to prevent accidental deletion of production data
    const count = await prisma.test.count();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already seeded. Skipping to protect data.' });
    }

    await prisma.question.deleteMany();
    await prisma.test.deleteMany();

    const test1 = await prisma.test.create({
      data: {
        title: 'Wildlife Guard Mock Tests',
        description: 'Prepare Now - 100% Syllabus Coverage - Top Mocktests. JKSSB Wildlife Guard Mock Test Series 2025. Are you aspiring to serve in the...',
        category: 'JKSSB',
        isFree: false,
        price: 99,
        originalPrice: 299,
        durationMinutes: 60,
        questions: {
          create: [
            { text: 'Which national park is located in J&K?', options: JSON.stringify(['Dachigam', 'Jim Corbett', 'Kaziranga', 'Kanha']), correctAnswer: 'Dachigam' },
            { text: 'Wildlife Protection Act was enacted in which year?', options: JSON.stringify(['1972', '1980', '1986', '1990']), correctAnswer: '1972' }
          ]
        }
      }
    });

    const test2 = await prisma.test.create({
      data: {
        title: 'ssc sub inspector cpo mock tests 2026',
        description: 'SSC Sub Inspector (CPO) Mock Tests 2026 - Complete Online Test Series. Exam Pattern Based Tests. Improve Speed & Accuracy. Complete Practice Real Exam Experience.',
        category: 'SSC',
        isFree: false,
        price: 99,
        originalPrice: 299,
        durationMinutes: 120,
        questions: {
          create: [
            { text: 'Who is the author of "My Experiments with Truth"?', options: JSON.stringify(['Jawaharlal Nehru', 'Mahatma Gandhi', 'Rabindranath Tagore', 'Bhagat Singh']), correctAnswer: 'Mahatma Gandhi' },
            { text: 'Which river is known as the Sorrow of Bihar?', options: JSON.stringify(['Ganga', 'Kosi', 'Son', 'Gandak']), correctAnswer: 'Kosi' }
          ]
        }
      }
    });

    const test3 = await prisma.test.create({
      data: {
        title: 'Transport and Communication MCQs - JKSSB Free Practice Test',
        description: 'Practice Transport and Communication MCQs for JKSSB exams with this free online test, specially prepared according to the latest JKSSB...',
        category: 'JKSSB',
        isFree: true,
        price: 0,
        originalPrice: 0,
        durationMinutes: 30,
        questions: {
          create: [
            { text: 'Which is the longest national highway in India?', options: JSON.stringify(['NH 44', 'NH 1', 'NH 2', 'NH 10']), correctAnswer: 'NH 44' },
            { text: 'When was the first railway train started in India?', options: JSON.stringify(['1853', '1857', '1947', '1890']), correctAnswer: '1853' }
          ]
        }
      }
    });

    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
