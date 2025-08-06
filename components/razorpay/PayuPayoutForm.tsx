'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function PayuPayoutForm() {
  const [form, setForm] = useState({
    beneId: '',
    amount: '',
    remarks: '',
    merchantTransactionId: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/wallet/payu-payout/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setMessage(data.message || JSON.stringify(data));
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Initiate PayU Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Bene ID</Label>
              <Input
                name="beneId"
                placeholder="BENEFICIARY123"
                onChange={handleChange}
                value={form.beneId}
                required
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                name="amount"
                placeholder="1000"
                type="number"
                onChange={handleChange}
                value={form.amount}
                required
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Input
                name="remarks"
                placeholder="Withdrawal"
                onChange={handleChange}
                value={form.remarks}
              />
            </div>
            <div>
              <Label>Merchant Transaction ID</Label>
              <Input
                name="merchantTransactionId"
                placeholder="UNIQUE_TXN_ID"
                onChange={handleChange}
                value={form.merchantTransactionId}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Initiate Payout'}
            </Button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-green-600">
              Response: {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
