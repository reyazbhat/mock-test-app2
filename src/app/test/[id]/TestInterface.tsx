'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestInterface({ test }: { test: any }) {
  const router = useRouter();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOptionSelect = (optIndex: string) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optIndex });
  };

  const toggleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestionIdx)) {
      newMarked.delete(currentQuestionIdx);
    } else {
      newMarked.add(currentQuestionIdx);
    }
    setMarkedForReview(newMarked);
  };

  const handleSubmit = () => {
    let score = 0;
    test.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) {
        score += 1;
      }
    });

    // Store result in sessionStorage to show on results page
    const resultData = {
      score,
      total: test.questions.length,
      answers,
      testTitle: test.title
    };
    sessionStorage.setItem(`result-${test.id}`, JSON.stringify(resultData));

    router.push(`/results/${test.id}`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const question = test.questions[currentQuestionIdx];

  const getQuestionStatusColor = (idx: number) => {
    if (markedForReview.has(idx)) return 'var(--warning)';
    if (answers[idx] !== undefined) return 'var(--secondary)';
    return 'var(--border-color)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>{test.title}</h2>
        <div className="test-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft <= 60 ? 'var(--accent)' : 'var(--text-main)' }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} className="btn btn-primary">
            Submit Test
          </button>
        </div>
      </header>

      <div className="test-layout">
        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Question {currentQuestionIdx + 1} of {test.questions.length}</h3>
              <button onClick={toggleMarkForReview} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                {markedForReview.has(currentQuestionIdx) ? '★ Unmark' : '☆ Mark for Review'}
              </button>
            </div>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{question.text}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {question.options.map((opt: string, idx: number) => (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: `2px solid ${answers[currentQuestionIdx] === idx.toString() ? 'var(--primary)' : 'var(--border-color)'}`,
                    backgroundColor: answers[currentQuestionIdx] === idx.toString() ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input 
                    type="radio" 
                    name={`q-${currentQuestionIdx}`} 
                    checked={answers[currentQuestionIdx] === idx.toString()}
                    onChange={() => handleOptionSelect(idx.toString())}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>{opt}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn btn-secondary" 
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              >
                ← Previous
              </button>
              <button 
                className="btn btn-primary" 
                disabled={currentQuestionIdx === test.questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="test-sidebar">
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Question Palette</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {test.questions.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontWeight: 'bold',
                  backgroundColor: getQuestionStatusColor(idx),
                  color: getQuestionStatusColor(idx) === 'var(--border-color)' ? 'var(--text-primary)' : 'white',
                  boxShadow: currentQuestionIdx === idx ? '0 0 0 3px rgba(79, 70, 229, 0.4)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Legend</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--secondary)', borderRadius: '4px' }}></div>
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--warning)', borderRadius: '4px' }}></div>
              <span>Marked for Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }}></div>
              <span>Not Answered</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
