"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { PaymentFormData } from "@/lib/payu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
interface ApiResponse {
  success: boolean;
  paymentData?: any;
  message?: string;
}

const PaymentForm: React.FC = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    firstname: "John",
    email: "john@example.com",
    phone: "9876543210",
    amount: "100",
    productinfo: "Test Product",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.firstname.trim()) newErrors.firstname = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!formData.productinfo.trim())
      newErrors.productinfo = "Product info is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof PaymentFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/payu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.paymentData) {
        // Create form and submit to PayU
        const form = document.createElement("form");
        form.method = "POST";
        form.action =
          process.env.NEXT_PUBLIC_PAYU_BASE_URL ||
          "https://test.payu.in/_payment";

        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto p-4"
    >
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold text-white drop-shadow-md">
            💳 PayU Gateway
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md border border-blue-300 text-sm font-medium">
            🧪 Test Mode: No real money will be charged
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(
              [
                { name: "firstname", label: "Name", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone", type: "tel" },
                { name: "amount", label: "Amount (₹)", type: "number" },
                { name: "productinfo", label: "Product Info", type: "text" },
              ] as const
            ).map(({ name, label, type }) => (
              <div key={name} className="space-y-1">
                <Label htmlFor={name} className="text-white/90">
                  {label}
                </Label>
                <Input
                  type={type}
                  name={name}
                  id={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className={cn(
                    "bg-white/10 text-white border border-white/20 placeholder:text-white/50 focus:ring-2 focus:ring-blue-500 backdrop-blur",
                    errors[name] && "border-red-500"
                  )}
                  required
                />
                {errors[name] && (
                  <p className="text-red-400 text-sm">{errors[name]}</p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-300"
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentForm;
