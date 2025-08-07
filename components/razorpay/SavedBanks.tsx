"use client";
import { useEffect, useState } from "react";

export function SavedBanks({
  onSelect,
}: {
  onSelect: (bank: any) => void;
}) {
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBanks() {
      const res = await fetch("/api/wallet/beneficiaries");
      const data = await res.json();
      setBanks(data.banks);
    }
    fetchBanks();
  }, []);

  return (
    <div className="space-y-2">
      {banks.map((bank) => (
        <div
          key={bank.beneficiary_id}
          onClick={() => onSelect(bank)}
          className="p-2 border rounded cursor-pointer hover:bg-muted"
        >
          <p className="text-sm font-semibold">{bank.beneficiary_name}</p>
          <p className="text-xs">{bank.bank_account_number} ({bank.bank_ifsc})</p>
          {bank.is_primary && (
            <span className="text-sm text-green-400">Primary Account</span>
          )}
        </div>
      ))}
    </div>
  );
}
