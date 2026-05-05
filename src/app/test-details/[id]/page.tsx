import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PurchaseButton from './PurchaseButton';

export default async function TestDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const testId = resolvedParams.id;
  
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  if (!test) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let hasPurchased = false;
  let isAdmin = false;

  if (session?.user) {
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase() || '';
    if (adminEmails.includes(userEmail)) {
      isAdmin = true;
    }

    if (!test.isFree && !isAdmin) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_testId: {
            userId: (session.user as any).id,
            testId: test.id,
          }
        }
      });
      if (purchase) hasPurchased = true;
    }
  }

  const isUnlocked = test.isFree || hasPurchased || isAdmin;

  return (
    <>
      <main className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          {test.thumbnail ? (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={test.thumbnail} 
                alt={test.title} 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} 
              />
            </div>
          ) : (
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          )}
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            {test.title}
          </h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📁 {test.category}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ⏱️ {test.durationMinutes} mins
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📝 {test._count.questions} Qs
            </span>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Price: <strong style={{ color: test.isFree ? 'var(--success)' : 'var(--text-main)' }}>
              {test.isFree ? 'Free' : `₹${test.price}`}
            </strong>
          </p>

          {!session ? (
            <Link href={`/login?callbackUrl=/test-details/${test.id}`} className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem', maxWidth: '300px', display: 'inline-block', marginBottom: '2rem' }}>
              Login to Start Test
            </Link>
          ) : isUnlocked ? (
            <Link href={`/test/${test.id}`} className="btn btn-success" style={{ fontSize: '1.25rem', padding: '1rem 2rem', maxWidth: '300px', display: 'inline-block', marginBottom: '2rem' }}>
              Start Test Now →
            </Link>
          ) : (
            <PurchaseButton testId={test.id} price={test.price} />
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--success)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✓ Instant Access
            </span>
          </div>
        </div>

        <div className="instructions-card">
          <h3>💡 Exam Instructions</h3>
          <ul className="instructions-list">
            <li>This test is designed for <strong>{test.category}</strong> preparation.</li>
            <li>The test contains <strong>{test._count.questions} questions</strong>.</li>
            <li>You will have exactly <strong>{test.durationMinutes} minutes</strong> to complete the test.</li>
            <li>Ensure you have a stable internet connection before starting.</li>
            <li>The timer will start immediately after you click "Start Test Now".</li>
            <li>Do not refresh the page during the exam.</li>
          </ul>
        </div>
      </main>
    </>
  );
}


