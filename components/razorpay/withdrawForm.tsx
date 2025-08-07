import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StylishBeneficiaryForm from "./AddBankAccountForm";
import { ConfirmPasswordModal } from "./confirm-password-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const [beneForm, setBeneForm] =
    useState<Record<string, string>>(initialBeneForm);
  const [walletPassword, setWalletPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fetchBeneficiaries = async () => {
    try {
      const res = await fetch("/api/wallet/cashfree/list-bene");
      const data = await res.json();
      console.log(data);
      console.log(data.beneficiaries);
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

  const doWithdraw = async (password: string) => {
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
          walletPassword: password,
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
  const handleWithdraw = () => {
    setIsPasswordModalOpen(true);
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
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] tracking-wide"
      >
        Withdraw Funds
      </motion.h2>

      {beneficiaries.length === 0 ? (
        <Alert
          variant="default"
          className="bg-yellow-200/10 border-yellow-300/30 text-yellow-300"
        >
          <AlertDescription>
            No bank accounts found. Please add one below.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">
              Primary Bank Account
            </Label>

            <Select
              value={primaryIndex?.toString() ?? ""}
              onValueChange={(val) => handleChangePrimary(Number(val))}
            >
              <SelectTrigger className="w-full bg-white/5 border border-white/20 text-white">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white">
                {beneficiaries.map((b, idx) => (
                  <SelectItem
                    key={b._id}
                    value={idx.toString()}
                    className="text-white"
                  >
                    {b.beneficiary_name} — {b.bank_account_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-white/80 tracking-wide"
            >
              Enter Amount (INR)
            </Label>

            <Input
              id="amount"
              type="number"
              placeholder="e.g., 500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-gradient-to-br from-slate-900/60 via-slate-800/60 to-slate-900/60 
               text-white placeholder:text-white/40 
               border border-white/20 shadow-inner 
               rounded-xl px-4 py-2 backdrop-blur-md 
               focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition duration-200"
            />
          </div>

          <Button
            className="bg-white text-black hover:bg-white/80 transition"
            onClick={handleWithdraw}
            disabled={loading || primaryIndex === null || !amount}
          >
            {loading ? "Processing..." : "Withdraw to Primary Bank"}
          </Button>
          <ConfirmPasswordModal
            open={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onConfirm={(password: string) => {
              setIsPasswordModalOpen(false);
              doWithdraw(password);
            }}
            loading={loading}
          />
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
  className="relative inline-flex items-center justify-center px-6 py-2 rounded-xl text-white font-semibold transition-all bg-gradient-to-br from-blue-500/70 via-cyan-500/60 to-purple-600/70 border border-white/10 shadow-md backdrop-blur hover:scale-105 hover:shadow-lg hover:from-blue-600 hover:to-purple-700"
>
  <span className="text-lg">+ Create New Bank Account</span>
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
