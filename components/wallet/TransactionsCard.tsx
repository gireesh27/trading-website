"use client";

import { Button } from "../ui/button";
import { Transaction } from "@/types/wallet-types";
import React from "react";
import { Printer } from "lucide-react";
interface TransactionsCardProps {
  transactions: Transaction[];
}

const TransactionsCard: React.FC<TransactionsCardProps> = ({
  transactions,
}) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Wallet Transaction History From Trading View</title>
          <style>
            @media print {
              body {
                margin: 0;
                box-shadow: none;
              }

              .no-print {
                display: none;
              }

              .container {
                box-shadow: none;
                border: none;
              }
            }

            @page {
              size: A4 landscape;
              margin: 1cm;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 2rem;
              background-color: #f9fafb;
              color: #111827;
            }

            .container {
              width: 100%;
              max-width: 100%;
              margin: auto;
              background: white;
              padding: 2rem;
              border-radius: 0.5rem;
              box-shadow: 0 0 12px rgba(0,0,0,0.1);
              overflow-x: auto;
            }

            h2 {
              text-align: center;
              font-size: 1.75rem;
              margin-bottom: 1.5rem;
              color: #1f2937;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
            }

            th, td {
              border: 1px solid #d1d5db;
              padding: 0.5rem 0.75rem;
              text-align: center;
              font-size: 0.9rem;
              word-break: break-word;
            }

            th {
              background-color: #f3f4f6;
              font-weight: 600;
            }

            tr:nth-child(even) {
              background-color: #f9fafb;
            }

            .footer {
              display: flex;
              justify-content: center;
              gap: 1rem;
              margin-top: 2rem;
            }

            .btn {
              background-color: #3b82f6;
              color: white;
              border: none;
              padding: 0.6rem 1.2rem;
              font-size: 1rem;
              border-radius: 0.375rem;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }

            .btn:hover {
              background-color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Wallet Transaction History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                  .map((txn) => {
                    const date = txn.createdAt || txn.date;
                    const formattedDate = date
                      ? new Date(date).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                    return `
                      <tr>
                        <td>${formattedDate}</td>
                        <td>${txn.type || "-"}</td>
                        <td>${txn.symbol || "-"}</td>
                        <td>${txn.source || "-"}</td>
                        <td>${txn.status || "-"}</td>
                        <td>₹${Number(txn.amount || 0).toFixed(2)}</td>
                        <td>${txn._id || "-"}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>

            <div class="footer no-print">
              <button class="btn" onclick="window.close()">Close</button>
              <button class="btn" onclick="window.print()">Print</button>
            </div>
            
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <Button
      onClick={handlePrint}
      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-md transition-all duration-200 hover:scale-105 flex items-center gap-2"
    >
      <Printer className="w-5 h-5" />
      <span className="hidden sm:inline">Print</span>
    </Button>
  );
};

export default TransactionsCard;
