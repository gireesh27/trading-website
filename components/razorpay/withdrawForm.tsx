'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function WithdrawForm() {
  const [formData, setFormData] = useState({
    beneficiary_id: '',
    beneficiary_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    vpa: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/wallet/cashfree/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Withdrawal failed')

      toast.success('Withdrawal initiated successfully')
      setFormData({
        beneficiary_id: '',
        beneficiary_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        vpa: '',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-background px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-xl shadow-xl border border-gray-700 bg-gray-900 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Withdraw Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="beneficiary_id" className="text-white">
                Beneficiary ID
              </Label>
              <Input
                id="beneficiary_id"
                name="beneficiary_id"
                value={formData.beneficiary_id}
                onChange={handleChange}
                required
                placeholder="e.g. user_1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary_name" className="text-white">
                Beneficiary Name
              </Label>
              <Input
                id="beneficiary_name"
                name="beneficiary_name"
                value={formData.beneficiary_name}
                onChange={handleChange}
                pattern="[A-Za-z ]+"
                title="Only alphabets and spaces allowed"
                required
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_number" className="text-white">
                Bank Account Number
              </Label>
              <Input
                id="bank_account_number"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={handleChange}
                minLength={9}
                maxLength={18}
                placeholder="e.g. 123456789012"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_ifsc" className="text-white">
                Bank IFSC
              </Label>
              <Input
                id="bank_ifsc"
                name="bank_ifsc"
                value={formData.bank_ifsc}
                onChange={handleChange}
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                title="Enter valid IFSC (e.g., SBIN0004567)"
                placeholder="e.g. SBIN0001234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vpa" className="text-white">
                UPI ID (optional)
              </Label>
              <Input
                id="vpa"
                name="vpa"
                value={formData.vpa}
                onChange={handleChange}
                pattern="^[\\w.-]+@[\\w.-]+$"
                title="Enter valid UPI ID (e.g., test@upi)"
                placeholder="e.g. john@upi"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? 'Processing...' : 'Withdraw'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
