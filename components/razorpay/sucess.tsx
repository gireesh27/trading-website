import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentSuccess() {
  const router = useRouter();
  const { txnid } = router.query;
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (txnid) {
      // Fetch transaction details if needed
      console.log('Payment successful for transaction:', txnid);
    }
  }, [txnid]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Transaction ID: {txnid}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}