'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('JKSSB');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [duration, setDuration] = useState(30);
  const [thumbnail, setThumbnail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTestId, setEditTestId] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctAnswer: '0' }
  ]);

  const [existingTests, setExistingTests] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tests')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setExistingTests(data);
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExistingTests(prev => prev.filter(t => t.id !== id));
        if (editTestId === id) resetForm();
        router.refresh();
      } else {
        alert('Failed to delete test');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting test');
    }
  };

  const handleEdit = (test: any) => {
    setEditTestId(test.id);
    setTitle(test.title);
    setDescription(test.description);
    setCategory(test.category);
    setIsFree(test.isFree);
    setPrice(test.price);
    setOriginalPrice(test.originalPrice);
    setDuration(test.durationMinutes);
    setThumbnail(test.thumbnail || '');
    
    // Parse options from string back to array for each question
    const parsedQuestions = test.questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
    setQuestions(parsedQuestions.length > 0 ? parsedQuestions : [{ text: '', options: ['', '', '', ''], correctAnswer: '0' }]);
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditTestId(null);
    setTitle('');
    setDescription('');
    setCategory('JKSSB');
    setIsFree(true);
    setPrice(0);
    setOriginalPrice(0);
    setDuration(30);
    setThumbnail('');
    setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '0' }]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '0' }]);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editTestId ? `/api/tests/${editTestId}` : '/api/tests';
      const method = editTestId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          isFree,
          price,
          originalPrice,
          durationMinutes: duration,
          thumbnail,
          questions
        })
      });

      if (res.ok) {
        alert(editTestId ? 'Test updated successfully!' : 'Test created successfully!');
        const updatedTest = await res.json();
        
        if (editTestId) {
          setExistingTests(prev => prev.map(t => t.id === editTestId ? { ...updatedTest, questions } : t));
        } else {
          setExistingTests(prev => [updatedTest, ...prev]);
        }
        
        resetForm();
        router.refresh();
      } else {
        alert('Failed to create test');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title" style={{ marginBottom: 0 }}>Admin Panel</h1>
        <Link href="/" className="btn btn-outline" style={{ width: 'auto' }}>Back to Dashboard</Link>
      </header>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Manage Existing Tests</h2>
        {existingTests.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No tests available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {existingTests.map(t => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{t.title}</h4>
                  <small style={{ color: 'var(--text-secondary)' }}>{t.category} • {t.isFree ? 'Free' : `₹${t.price}`}</small>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => handleEdit(t)} 
                    className="btn btn-outline" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
                  >
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(t.id)} 
                    className="btn btn-outline" 
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--text-main)', margin: 0 }}>
            {editTestId ? 'Edit Mock Test' : 'Create New Mock Test'}
          </h2>
          {editTestId && (
            <button type="button" onClick={resetForm} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}>
              Cancel Edit
            </button>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Test Title</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. History Mock Exam 1"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Thumbnail Image URL (Optional)</label>
          <input 
            type="url" 
            className="form-control" 
            value={thumbnail} 
            onChange={(e) => setThumbnail(e.target.value)} 
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration (Minutes)</label>
          <input 
            type="number" 
            className="form-control" 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))} 
            min={1}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            className="form-control" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="JKSSB">JKSSB</option>
            <option value="JKPSC">JKPSC</option>
            <option value="SSC">SSC</option>
            <option value="Banking">Banking</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea 
            className="form-control" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={2}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="isFree"
            checked={isFree} 
            onChange={(e) => setIsFree(e.target.checked)} 
          />
          <label htmlFor="isFree" style={{ fontWeight: 'bold' }}>Is this a Free Test?</label>
        </div>

        {!isFree && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Selling Price (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                value={price} 
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)} 
                min={0}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Original Price (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                value={originalPrice} 
                onChange={(e) => setOriginalPrice(parseInt(e.target.value) || 0)} 
                min={0}
              />
            </div>
          </div>
        )}

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border)', borderStyle: 'solid' }} />

        <h3 style={{ marginBottom: '1.5rem' }}>Questions</h3>

        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', position: 'relative' }}>
            {questions.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeQuestion(qIndex)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 'bold' }}
              >
                ✕ Remove
              </button>
            )}
            
            <div className="form-group">
              <label className="form-label">Question {qIndex + 1}</label>
              <textarea 
                className="form-control" 
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                rows={2}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.9rem' }}>Option {optIndex + 1}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctAnswer === optIndex.toString()}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex.toString())}
                      title="Mark as correct answer"
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Select the radio button next to the correct option.
            </p>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" onClick={addQuestion} className="btn btn-secondary">
            + Add Question
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
            {isSubmitting ? 'Saving...' : editTestId ? 'Update Mock Test' : 'Save Mock Test'}
          </button>
        </div>
      </form>
    </main>
  );
}
