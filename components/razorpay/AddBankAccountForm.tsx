import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type StylishBeneficiaryFormProps = {
  beneForm: Record<string, string>;
  setBeneForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddBeneficiary: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  resetForm: () => void;
};

export default function StylishBeneficiaryForm({
  beneForm,
  setBeneForm,
  handleAddBeneficiary,
  isSubmitting,
  errorMessage,
  successMessage,
  resetForm,
}: StylishBeneficiaryFormProps) {
  return (
    <form
      onSubmit={handleAddBeneficiary}
      className="space-y-6 max-w-xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl transition-all"
    >
      {Object.entries(beneForm).map(([key, val]) => (
        <div key={key} className="space-y-2">
          <Label
            htmlFor={key}
            className="capitalize text-sm font-medium text-white tracking-wide"
          >
            {key.replaceAll("_", " ")}
          </Label>
          <Input
            id={key}
            className="w-full bg-white/10 text-white placeholder:text-white/40 border border-white/20 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
            placeholder={key.replaceAll("_", " ")}
            value={val}
            onChange={(e) =>
              setBeneForm((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
          />
        </div>
      ))}

      {errorMessage && (
        <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/30">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="text-green-400 text-sm bg-green-400/10 px-3 py-2 rounded-lg border border-green-400/30">
          {successMessage}
        </p>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-600 text-white hover:bg-cyan-700 transition-all rounded-xl px-6"
        >
          {isSubmitting ? "Submitting..." : "Add Beneficiary"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="border-white/20 text-black dark:text-white hover:bg-white/10 transition-all rounded-xl px-6"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
