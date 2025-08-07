import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AnimatedCard = motion(Card);

export default function StylishBeneficiaryForm({ beneForm, setBeneForm, handleAddBeneficiary }: {
  beneForm: Record<string, string>;
  setBeneForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddBeneficiary: () => void;
}) {
  return (
    <AnimatedCard
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6 rounded-2xl shadow-xl bg-white dark:bg-zinc-900 w-full max-w-xl mx-auto"
    >
      <CardContent className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Add New Bank Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please enter the required beneficiary details
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(beneForm).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key} className="capitalize text-sm">
                {key.replaceAll("_", " ")}
              </Label>
              <Input
                id={key}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-primary"
                placeholder={key.replaceAll("_", " ")}
                value={val}
                onChange={(e) =>
                  setBeneForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-6 rounded-xl py-6 text-base font-medium"
          onClick={handleAddBeneficiary}
        >
          Save Beneficiary
        </Button>
      </CardContent>
    </AnimatedCard>
  );
}
