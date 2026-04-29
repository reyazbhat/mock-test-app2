'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem(`result-${id}`);
    if (data) {
      setResultData(JSON.parse(data));
      // Optional: Clear data after viewing
      // sessionStorage.removeItem(`result-${id}`);
    }
  }, [id]);

  if (!resultData) {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading Results...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>If this takes too long, you might not have taken this test.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Go Home</Link>
        </div>
      </main>
    );
  }

  const percentage = Math.round((resultData.score / resultData.total) * 100);
  let statusColor = 'var(--danger)';
  if (percentage >= 75) statusColor = 'var(--secondary)';
  else if (percentage >= 50) statusColor = 'var(--warning)';

  return (
    <main className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="title">Test Results</h1>
        <p className="subtitle">For: {resultData.testTitle}</p>
      </header>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '4rem', margin: 0, color: statusColor }}>
          {percentage}%
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You scored {resultData.score} out of {resultData.total}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{resultData.score}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Correct Answers</div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{resultData.total - resultData.score}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Incorrect / Unanswered</div>
          </div>
        </div>

        <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
