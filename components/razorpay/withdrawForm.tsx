import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StylishBeneficiaryForm  from "./AddBankAccountForm";

export default function WithdrawForm() {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [amount, setAmount] = useState(0);
  const [selectedBeneIndex, setSelectedBeneIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [beneForm, setBeneForm] = useState({
    beneficiary_name: "",
    beneficiary_email: "",
    beneficiary_phone: "",
    account: "",
    ifsc: "",
    vpa: "",
    instrument_type: "bankaccount",
    beneficiary_address: "",
    beneficiary_city: "",
    beneficiary_state: "",
    beneficiary_postal_code: "",
  });

  const fetchBeneficiaries = async () => {
    try {
      const res = await fetch("/api/wallet/cashfree/list-bene");
      const data = await res.json();
      setBeneficiaries(data.beneficiaries || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch beneficiaries",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleWithdraw = async () => {
    if (selectedBeneIndex === null) {
      return toast({
        title: "Missing Selection",
        description: "Select a bank account",
        variant: "destructive",
      });
    }

    if (!amount || amount <= 0) {
      return toast({
        title: "Invalid Amount",
        description: "Enter a valid amount to withdraw",
        variant: "destructive",
      });
    }

    const selectedBene = beneficiaries[selectedBeneIndex];
    setLoading(true);

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedBene,
          transfer_amount: Number(amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong");
      }

      toast({
        title: "Withdrawal Initiated",
        description: "Your funds are on their way.",
      });
    } catch (err: any) {
      toast({
        title: "Withdraw Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async () => {
    try {
      const res = await fetch("/api/wallet/cashfree/add-bene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beneForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong");
      }

      toast({
        title: "Beneficiary Added",
        description: "Bank account saved successfully.",
      });

      setBeneForm({
        beneficiary_name: "",
        beneficiary_email: "",
        beneficiary_phone: "",
        account: "",
        ifsc: "",
        vpa: "",
        instrument_type: "bankaccount",
        beneficiary_address: "",
        beneficiary_city: "",
        beneficiary_state: "",
        beneficiary_postal_code: "",
      });

      fetchBeneficiaries();
    } catch (err: any) {
      toast({
        title: "Add Beneficiary Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white">Withdraw Funds</h2>

      {beneficiaries.length === 0 && (
        <div className="bg-yellow-200/20 text-yellow-300 border border-yellow-300/40 p-4 rounded-md text-sm">
          No bank accounts found. Please add one below.
        </div>
      )}

      {beneficiaries.length > 0 && (
        <div className="space-y-2">
          <Label
            htmlFor="bank-select"
            className="text-white text-sm font-medium"
          >
            Select Bank Account
          </Label>
          <select
            id="bank-select"
            className="w-full bg-white/5 text-white placeholder:text-white/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
            onChange={(e) => setSelectedBeneIndex(Number(e.target.value))}
            defaultValue=""
          >
            <option value="" disabled>
              Select a saved bank
            </option>
            {beneficiaries.map((b, idx) => (
              <option key={b._id} value={idx}>
                {b.beneficiary_name} — {b.bank_account_number}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-white text-sm font-medium">
          Enter Amount (INR)
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="e.g., 500"
          className="bg-white/5 text-white placeholder:text-white/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-4 flex-wrap items-start">
        <Button
          className="bg-white text-black hover:bg-white/80 transition"
          onClick={handleWithdraw}
          disabled={
            loading || selectedBeneIndex === null || !amount || amount <= 0
          }
        >
          {loading ? "Processing..." : "Withdraw to Bank"}
        </Button>
      </div>

      <div className="h-px bg-white/20 my-6" />

      <div className="bg-white/5 p-6 rounded-xl border border-white/20">
        <h3 className="text-xl font-semibold mb-4 text-white/80">
          Add New Bank Account
        </h3>

        <StylishBeneficiaryForm
          beneForm={beneForm}
          setBeneForm={setBeneForm}
          handleAddBeneficiary={handleAddBeneficiary}
        />
      </div>
    </div>
  );
}
