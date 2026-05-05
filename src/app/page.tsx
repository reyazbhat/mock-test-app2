import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let tests: any[] = [];
  try {
    tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  } catch (error) {
    console.error("PRISMA ERROR DETAILS:", error);
  }

  const freeTests = tests.filter((t: any) => t.isFree);
  const paidTests = tests.filter((t: any) => !t.isFree);

  const TestCard = ({ test }: { test: any }) => (
    <div key={test.id} className="card">
      <div 
        className={`card-banner ${test.category === 'SSC' ? 'ssc-banner' : test.isFree ? 'free-banner' : ''}`}
        style={test.thumbnail ? { background: `url(${test.thumbnail}) center/cover no-repeat` } : {}}
      >
        <span style={{ position: 'absolute', top: '10px', right: '10px' }} className="badge series">Mock Test</span>
        {test.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <span className="badge new" style={{ top: '10px', right: '10px' }}>NEW</span>
        )}
        {!test.thumbnail && test.title}
      </div>
      <div className="card-content">
        <h2 className="card-title">{test.title}</h2>
        <p className="card-desc">
          {test.description ? test.description : `${test.category} Mock Test Series. Prepare Now!`}
        </p>
        
        {test.isFree ? (
          <div className="card-price">
            <span className="price-current">Free</span>
          </div>
        ) : (
          <div className="card-price">
            <span className="price-current">₹{test.price}</span>
            {test.originalPrice > test.price && (
              <>
                <span className="price-original">₹{test.originalPrice}</span>
                <span className="price-discount">
                  {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        )}
        
        <Link href={`/test-details/${test.id}`} className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: 'auto' }}>
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <main className="container">
        <div className="title-section">
          <p style={{ color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TEST SERIES</p>
          <h1>All Mock Tests</h1>
          <p>Explore our complete collection of mock tests for JKSSB, SSC, UPSC, RRB, Banking, and all other competitive exams.</p>
        </div>

        {tests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2>No tests available yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>
              Tests will appear here once added by the admin.
            </p>
          </div>
        ) : (
          <>
            {paidTests.length > 0 && (
              <div className="section-grid">
                {paidTests.map((test: any) => <TestCard key={test.id} test={test} />)}
              </div>
            )}

            {freeTests.length > 0 && (
              <>
                <div className="title-section" style={{ marginTop: '5rem' }}>
                  <span className="badge free" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>🎁 FREE CONTENT</span>
                  <h1>All Free Mock Tests</h1>
                  <p>Practice with our premium quality free tests.</p>
                </div>
                <div className="section-grid">
                  {freeTests.map((test: any) => <TestCard key={test.id} test={test} />)}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
