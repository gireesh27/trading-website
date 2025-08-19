import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StylishBeneficiaryForm from "./AddBankAccountForm";
import { ConfirmPasswordModal } from "./confirm-password-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { DollarSign, Banknote, AlertTriangle } from "lucide-react"; // Assuming lucide-react for icons
import { toast } from "react-toastify";
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
      toast.error("Failed to fetch beneficiaries");
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const doWithdraw = async (password: string) => {
    // No bank selected
    if (primaryIndex === null || !beneficiaries[primaryIndex]) {
      toast.error(
        "No Bank Selected: You must select or set a primary bank account."
      );
      return; // Stop execution
    }

    // Invalid amount
    if (!amount || amount <= 0) {
      toast.error("Invalid Amount: Enter a valid amount to withdraw.");
      return; // Stop execution
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

      // Withdrawal Initiated
      toast.success(`${amount}INR Withdrawal Successful: ${data.message}`);
      setAmount(0);
    } catch (err: any) {
      // Withdraw Failed
      toast.error(`Withdraw Failed: ${err.message}`);
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
      // Beneficiary Added
      toast.success("Beneficiary Added: Bank account saved successfully.");

      setBeneForm(initialBeneForm);
      setBeneFormVisible(false);
      await fetchBeneficiaries();
    } catch (err: any) {
      setErrorMessage(err.message);
      // Add Beneficiary Failed
      toast.error(`Add Beneficiary Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePrimary = (index: number) => {
    setPrimaryIndex(index);
    // Primary Account Changed
    toast.info(
      `Primary Account Changed: Primary set to ${beneficiaries[index]?.beneficiary_name}`
    );
  };

return (
  <div
    className="space-y-8 max-w-2xl mx-auto p-8 
    bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl"
  >
    {/* --- Header --- */}
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500
        bg-clip-text text-transparent animate-gradient drop-shadow-lg
        hover:drop-shadow-xl transition-all duration-300 ease-in-out"
    >
      Withdraw to Bank
    </motion.h2>

    {/* --- No Beneficiaries Alert --- */}
    {beneficiaries.length === 0 ? (
      <Alert
        variant="default"
        className="bg-amber-500/10 border-amber-400/30 text-amber-300 rounded-lg"
      >
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="ml-2">
          No bank accounts found. Please add one to proceed.
        </AlertDescription>
      </Alert>
    ) : (
      <>
        {/* --- Bank Account Selector --- */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-300 tracking-wide">
            Select Account
          </Label>
          <Select
            value={primaryIndex?.toString() ?? ""}
            onValueChange={(val) => handleChangePrimary(Number(val))}
          >
            <SelectTrigger
              className="w-full h-12 
                bg-gray-900/50 border border-white/10 text-white 
                placeholder:text-gray-400 rounded-lg shadow-inner 
                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                transition-all duration-300  "
            >
              <SelectValue placeholder="Choose a destination account..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-950/80 backdrop-blur-lg border-white/10 text-white rounded-lg">
              {beneficiaries.map((b, idx) => (
                <SelectItem
                  key={b._id}
                  value={idx.toString()}
                  className="focus:bg-blue-500/20 cursor-pointer transition-colors focus:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="h-4 w-4 text-gray-400" />
                    <span>
                      {b.beneficiary_name} — **** {b.bank_account_number.slice(-4)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- Amount Input --- */}
        <div className="space-y-3">
          <Label
            htmlFor="amount"
            className="text-sm font-medium text-gray-300 tracking-wide"
          >
            Amount (INR)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="amount"
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-12 pl-10 
                bg-gray-900/50 border border-white/10 text-white 
                placeholder:text-gray-400 rounded-lg shadow-inner 
                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                transition-all duration-300"
            />
          </div>
        </div>

        {/* --- Withdraw Button --- */}
        <Button
          className="w-full font-semibold 
            bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 
            text-white py-3 rounded-lg 
            shadow-lg shadow-blue-500/20 
            hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 
            active:scale-100 
            transition-all duration-300 ease-in-out 
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          onClick={handleWithdraw}
          disabled={loading || primaryIndex === null || !amount}
        >
          {loading ? "Processing..." : "Withdraw to Bank"}
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

    {/* --- Divider --- */}
    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    {/* --- Add New Account Section --- */}
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">
        {beneFormVisible ? "New Account Details" : "Manage Beneficiaries"}
      </h3>

      {!beneFormVisible ? (
        <Button
          onClick={() => setBeneFormVisible(true)}
          className="w-full font-semibold 
            bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 
            text-white py-3 rounded-lg 
            active:scale-100 
            transition-all duration-300 ease-in-out"
        >
          + Add New Bank Account
        </Button>
      ) : (
        <StylishBeneficiaryForm
          beneForm={beneForm}
          setBeneForm={setBeneForm}
          handleAddBeneficiary={handleAddBeneficiary}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          resetForm={() => setBeneForm(initialBeneForm)}
          setBeneFormVisible={setBeneFormVisible}
        />
      )}
    </div>
  </div>
);

}
