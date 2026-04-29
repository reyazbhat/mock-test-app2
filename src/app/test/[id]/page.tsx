import prisma from '@/lib/prisma';
import TestInterface from './TestInterface';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function TestPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const test = await prisma.test.findUnique({
    where: { id },
    include: { questions: true }
  });

  if (!test) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!test.isFree) {
    if (!session?.user) {
      redirect(`/test-details/${id}`);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase() || '';
    const isAdmin = adminEmails.includes(userEmail);

    if (!isAdmin) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_testId: {
            userId: (session.user as any).id,
            testId: id,
          }
        }
      });

      if (!purchase) {
        redirect(`/test-details/${id}`);
      }
    }
  }

  // Parse the options from string to array for the client
  const parsedTest = {
    ...test,
    questions: test.questions.map((q: any) => ({
      ...q,
      options: JSON.parse(q.options)
    }))
  };

  return <TestInterface test={parsedTest} />;
}
