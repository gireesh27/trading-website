"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Landmark,
  Hash,
  Building,
  MapPin,
  Globe,
  Box,
  AtSign,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StylishBeneficiaryFormProps = {
  beneForm: Record<string, string>;
  setBeneForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddBeneficiary: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  resetForm: () => void;
  setBeneFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

// --- Form Field Configuration ---
const formFields = [
  { name: "beneficiary_name", label: "Full Name", icon: <User size={18} /> },
  {
    name: "beneficiary_email",
    label: "Email Address",
    icon: <Mail size={18} />,
  },
  {
    name: "beneficiary_phone",
    label: "Phone Number",
    icon: <Phone size={18} />,
  },
  { name: "account", label: "Account Number", icon: <Hash size={18} /> },
  { name: "ifsc", label: "IFSC Code", icon: <Landmark size={18} /> },
  { name: "vpa", label: "UPI ID (VPA)", icon: <AtSign size={18} /> },
  { name: "beneficiary_address", label: "Address", icon: <MapPin size={18} /> },
  { name: "beneficiary_city", label: "City", icon: <Building size={18} /> },
  { name: "beneficiary_state", label: "State", icon: <Globe size={18} /> },
  {
    name: "beneficiary_postal_code",
    label: "Postal Code",
    icon: <Box size={18} />,
  },
];

export default function StylishBeneficiaryForm({
  beneForm,
  setBeneForm,
  handleAddBeneficiary,
  isSubmitting,
  errorMessage,
  successMessage,
  resetForm,
  setBeneFormVisible,
}: StylishBeneficiaryFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setBeneForm((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={handleAddBeneficiary}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {formFields.map(({ name, label, icon }, index) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="space-y-2"
          >
            <Label
              htmlFor={name}
              className="text-sm font-medium text-slate-300"
            >
              {label}
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
              </span>
              <Input
                id={name}
                className="h-12 pl-10 bg-slate-800/60 text-white border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all"
                placeholder={`Enter ${label}`}
                value={beneForm[name]}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/30">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 text-emerald-400 text-sm bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/30">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        {/* Add Beneficiary */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="
      w-full sm:w-auto flex-1
      h-12
      px-6
      text-sm
      font-semibold
      text-white
      rounded-lg
      bg-gradient-to-r from-cyan-500 to-blue-600
    
      transition-transform  duration-200 ease-in-out
      flex items-center justify-center
      gap-2
    "
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Add Beneficiary"
          )}
        </Button>

        {/* Reset */}
        <Button
          type="button"
          variant="secondary"
          onClick={resetForm}
          className="
      w-full sm:w-auto flex-1
      h-12
      px-6
      rounded-lg
      border border-gray-400
  
      font-medium
      shadow-sm
      bg-white/20
      hover:bg-white/30
      text-white
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
      transition duration-200 ease-in-out
    "
        >
          Reset
        </Button>

        {/* Cancel */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setBeneFormVisible(false)}
          className="
      w-full sm:w-auto flex-1
      h-12
      px-6
      rounded-lg
      text-gray-400
      font-medium
      hover:bg-gray-700/20
      hover:text-white
      transition-colors duration-200 ease-in-out
    "
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
