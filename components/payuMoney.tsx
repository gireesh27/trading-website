"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn"; // Assumes you have a utility function for merging Tailwind classes
import { AtSign, CreditCard, FlaskConical, IndianRupee, Info, Loader2, Phone, User, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
// --- TYPE DEFINITIONS ---
// This interface defines the shape of our form data.
interface PaymentFormData {
  firstname: string;
  email: string;
  phone: string;
  amount: string;
  productinfo: string;
}

// This defines the expected shape of the API response from our backend.
interface ApiResponse {
  success: boolean;
  paymentData?: Record<string, string>; // The data to be sent to PayU
  message?: string;
}

// --- CONSTANTS ---
// We define the input fields as a constant array to easily map over them in the form.
const inputFields = [
  { name: "firstname", label: "Full Name", type: "text", icon: <User size={18} /> },
  { name: "email", label: "Email Address", type: "email", icon: <AtSign size={18} /> },
  { name: "phone", label: "Phone Number", type: "tel", icon: <Phone size={18} /> },
  { name: "amount", label: "Amount", type: "number", icon: <IndianRupee size={18} /> },
  { name: "productinfo", label: "Payment For", type: "text", icon: <Info size={18} /> },
] as const; // Using "as const" makes the `name` property a literal type for better type-safety.


// --- COMPONENT ---
const PayuForm: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState<PaymentFormData>({
    firstname: "John Doe",
    email: "john.doe@example.com",
    phone: "9876543210",
    amount: "100",
    productinfo: "Test Product Purchase",
  });
  const [loading, setLoading] = useState<boolean>(false);
  // Errors state uses a partial type, as not all fields may have errors at once.
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  // --- FORM VALIDATION ---
  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    
    // Check each field for valid content.
    if (!formData.firstname.trim()) newErrors.firstname = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Please enter a valid 10-digit phone number";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "A valid amount is required";
    if (!formData.productinfo.trim()) newErrors.productinfo = "Product information is required";

    setErrors(newErrors);
    // The form is valid if the newErrors object has no keys.
    return Object.keys(newErrors).length === 0;
  };

  // --- EVENT HANDLERS ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const fieldName = name as keyof PaymentFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear the error for a field as soon as the user starts correcting it.
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();

  // Stop submission if validation fails.
  if (!validateForm()) return;

  setLoading(true);

  try {
    // Call backend API to get the hashed payment data.
    const response = await fetch("/api/wallet/payu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data: ApiResponse = await response.json();

    if (data.success && data.paymentData) {
      // Show a success toast for initiating payment
      toast.success("Redirecting to PayU payment gateway...");

      // Dynamically create a form and submit it to PayU
      const form = document.createElement("form");
      form.method = "POST";
      form.action = process.env.NEXT_PUBLIC_PAYU_BASE_URL || "https://test.payu.in/_payment";

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
      // Payment initiation failed
      toast.error(data.message || "Payment initiation failed. Please try again.");
      console.error("Payment initiation failed:", data.message);
    }
  } catch (error: any) {
    toast.error("An unexpected error occurred. Please try again.");
    console.error("Payment submission error:", error);
  } finally {
    setLoading(false);
  }
};

  // --- RENDER ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="max-w-lg mx-auto px-4"
    >
      <Card className="bg-slate-900/50 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0" />
        
        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="flex justify-center items-center gap-3 text-3xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
              <CreditCard className="text-cyan-300" />
              Secure Payment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-3 bg-cyan-900/50 text-cyan-200 rounded-lg border border-cyan-700/50 text-sm font-medium flex items-center gap-3">
              <FlaskConical size={20} />
              <span>Test Mode: No real money will be charged.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {inputFields.map(({ name, label, type, icon }) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name} className="text-slate-300 font-medium">
                    {label}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {icon}
                    </span>
                    <Input
                      type={type}
                      name={name}
                      id={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 h-12 bg-slate-800/60 text-white border-2 border-slate-700 placeholder:text-slate-500 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all duration-300",
                        errors[name] && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
                      )}
                      required
                    />
                  </div>
                  {errors[name] && (
                    <p className="text-red-400 text-sm flex items-center gap-1.5 pt-1">
                       <AlertTriangle size={14} /> {errors[name]}
                    </p>
                  )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:scale-105 disabled:hover:scale-100 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform"
              >
                {loading ? (
                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Pay Now"
                )}
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default PayuForm;
