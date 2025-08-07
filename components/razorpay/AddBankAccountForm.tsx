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
      className="space-y-6 max-w-xl mx-auto p-6 rounded-2xl border border-gray-800 bg-black/30 backdrop-blur-md shadow-xl"
    >
      {Object.entries(beneForm).map(([key, val]) => (
        <div key={key} className="space-y-2">
          <Label
            htmlFor={key}
            className="capitalize text-sm text-gray-300 tracking-wide"
          >
            {key.replaceAll("_", " ")}
          </Label>
          <Input
            id={key}
            className="bg-white/10 backdrop-blur-md text-white placeholder:text-gray-400 border border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
        <p className="text-red-500 text-sm bg-red-500/10 px-2 py-1 rounded">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">
          {successMessage}
        </p>
      )}

      <div className="flex gap-4 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white hover:bg-gray-800 transition rounded-xl"
        >
          {isSubmitting ? "Submitting..." : "Add Beneficiary"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
