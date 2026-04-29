'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseButton({ testId, price }: { testId: string; price: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulatedPayment = async () => {
    // This simulates the Razorpay Checkout Modal
    const confirm = window.confirm(`Simulate payment of ₹${price} for this test? (In a real app, the Razorpay modal would open here).`);
    
    if (confirm) {
      setLoading(true);
      try {
        const res = await fetch('/api/payments/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId }),
        });

        if (res.ok) {
          alert('Payment Successful! The test is now unlocked.');
          router.refresh(); // Refresh to show the Start Test button
        } else {
          alert('Payment failed.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during payment.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleSimulatedPayment}
      disabled={loading}
      className="btn btn-primary" 
      style={{ fontSize: '1.25rem', padding: '1rem 2rem', maxWidth: '300px', display: 'inline-block', marginBottom: '2rem' }}
    >
      {loading ? 'Processing...' : `Pay ₹${price} to Unlock`}
    </button>
  );
}
