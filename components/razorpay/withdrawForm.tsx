import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StylishBeneficiaryForm from "./AddBankAccountForm";

export const initialBeneForm = {
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
};

export default function WithdrawForm() {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [beneFormVisible, setBeneFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [beneForm, setBeneForm] = useState<Record<string, string>>(initialBeneForm)
  
  const fetchBeneficiaries = async () => {
    try {
      const res = await fetch("/api/wallet/cashfree/list-bene");
      const data = await res.json();
      console.log(data);
      console.log(data.beneficiaries)
      setBeneficiaries(data.beneficiaries || []);
      if (data.beneficiaries?.length > 0) setPrimaryIndex(0); // set first as default
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
    if (primaryIndex === null || !beneficiaries[primaryIndex]) {
      return toast({
        title: "No Bank Selected",
        description: "You must select or set a primary bank account.",
        variant: "destructive",
      });
    }

    if (!amount || amount <= 0) {
      return toast({
        title: "Invalid Amount",
        description: "Enter a valid amount to withdraw.",
        variant: "destructive",
      });
    }

    const selectedBene = beneficiaries[primaryIndex];
    setLoading(true);

    try {
      const res = await fetch("/api/wallet/cashfree/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedBene,
          transfer_amount: Number(amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");

      toast({
        title: "Withdrawal Initiated",
        description: "Your funds are on their way.",
      });

      setAmount(0);
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
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/wallet/cashfree/add-bene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beneForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");

      setSuccessMessage("Beneficiary added successfully.");
      toast({
        title: "Beneficiary Added",
        description: "Bank account saved successfully.",
      });

      setBeneForm(initialBeneForm);
      setBeneFormVisible(false);
      await fetchBeneficiaries();
    } catch (err: any) {
      setErrorMessage(err.message);
      toast({
        title: "Add Beneficiary Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePrimary = (index: number) => {
    setPrimaryIndex(index);
    toast({
      title: "Primary Account Changed",
      description: `Primary set to ${beneficiaries[index]?.beneficiary_name}`,
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white">Withdraw Funds</h2>

      {beneficiaries.length === 0 ? (
        <div className="bg-yellow-200/20 text-yellow-300 border border-yellow-300/40 p-4 rounded-md text-sm">
          No bank accounts found. Please add one below.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">
              Primary Bank Account
            </Label>
            <select
              className="w-full bg-white/5 text-white placeholder:text-white/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
              value={primaryIndex ?? ""}
              onChange={(e) => handleChangePrimary(Number(e.target.value))}
            >
              {beneficiaries.map((b, idx) => (
                <option key={b._id} value={idx}>
                  {b.beneficiary_name} — {b.bank_account_number}
                </option>
              ))}
            </select>
          </div>

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

          <Button
            className="bg-white text-black hover:bg-white/80 transition"
            onClick={handleWithdraw}
            disabled={loading || primaryIndex === null || !amount}
          >
            {loading ? "Processing..." : "Withdraw to Primary Bank"}
          </Button>
        </>
      )}

      <div className="h-px bg-white/20 my-6" />

      <div className="bg-white/5 p-6 rounded-xl border border-white/20">
        <h3 className="text-xl font-semibold mb-4 text-white/80">
          {beneFormVisible ? "Add New Bank Account" : "Add Another Bank"}
        </h3>

        {!beneFormVisible ? (
          <Button
            onClick={() => setBeneFormVisible(true)}
            className="bg-white text-black"
          >
            + Create New Bank Account
          </Button>
        ) : (
          <>
            <StylishBeneficiaryForm
              beneForm={beneForm}
              setBeneForm={setBeneForm}
              handleAddBeneficiary={handleAddBeneficiary}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              successMessage={successMessage}
              resetForm={() => setBeneForm(initialBeneForm)}
            />
            
          </>
        )}
      </div>
    </div>
  );
}
