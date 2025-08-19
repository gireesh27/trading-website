"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

// --- DATA STRUCTURES ---
const razorpayData = {
  domestic: {
    title: "Domestic Test Cards",
    headers: ["Network", "Card Number", "CVV", "Expiry"],
    rows: [
      ["Mastercard", "2305 3242 5784 8228", "Random", "Any future date"],
      ["VISA", "4386 2894 0766 0153", "Random", "Any future date"],
    ],
  },
  international: {
    title: "International Payments",
    headers: ["Network", "Card Number", "CVV", "Expiry"],
    rows: [
      ["Mastercard", "5421 1393 0609 0628", "Random", "Any future date"],
      ["Mastercard", "5105 1051 0510 5100", "Random", "Any future date"],
      ["VISA", "4012 8888 8888 1881", "Random", "Any future date"],
      ["Mastercard", "5104 0600 0000 0008", "Random", "Any future date"],
    ],
    footer: (
      <div className="mt-4 text-sm text-gray-400">
        <p className="font-semibold mb-2 text-gray-200">💡 Handy Tips:</p>
        <p>
          When using Mastercard <code>5105 1051 0510 5100</code>, use the following address:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-xs">
          <li>21 Applegate Apartment, Rockledge Street</li>
          <li>New York, New York, US - 11561</li>
        </ul>
      </div>
    ),
  },
  subscriptions: {
    title: "Subscriptions",
    headers: ["Type", "Network", "Card Type", "Card Number", "CVV", "Expiry"],
    rows: [
      ["Domestic", "VISA", "Credit", "4718 6091 0820 4366", "Random", "Any future date"],
      ["International", "Mastercard", "Credit", "5104 0155 5555 5558", "Random", "Any future date"],
      ["International", "Mastercard", "Debit", "5104 0600 0000 0008", "Random", "Any future date"],
    ],
  },
  emi: {
    title: "EMI Payments",
    headers: ["Network", "Card Number", "CVV", "Expiry"],
    rows: [
      ["Mastercard", "5241 8100 0000 0000", "Random", "Any future date"],
    ],
  },
};

const payuData = {
  credit: {
    title: "Credit Cards",
    headers: ["Flow", "Card Number", "Network", "Expiry", "CVV", "OTP"],
    rows: [
      ["Merchant Hosted", "5123 4567 8901 2346", "Mastercard", "05/30", "123", "123456"],
      ["Merchant Hosted", "4012 0010 3714 1112", "VISA", "05/30", "123", "123456"],
      ["Server-to-Server", "5497 7744 1517 0603", "Mastercard", "05/30", "412", "123456"],
      ["Merchant Hosted", "6082 0153 0957 7308", "RUPAY", "05/30", "123", "123456"],
      ["Merchant Hosted", "3702 9506 1673 669", "AMEX", "03/30", "1234", "123456"],
    ],
  },
  debit: {
    title: "Debit Cards",
    headers: ["Card Number", "Network", "Expiry", "CVV", "OTP"],
    rows: [
      ["5118-7000-0000-0003", "Mastercard", "05/30", "123", "123456"],
      ["4594-5380-5063-9999", "VISA", "05/30", "123", "123456"],
    ],
  },
};

// --- REUSABLE COMPONENTS ---

// Enhanced Copy Button with Animation
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copied) return;
    // This removes all spaces and hyphens before copying
    navigator.clipboard.writeText(text.replace(/[\s-]/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      size="icon"
      variant="ghost"
      className="h-7 w-7 text-gray-400 hover:text-white shrink-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={copied ? "check" : "copy"}
          initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, rotate: 30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

// Card with new stylish look and responsive table
function CardTable({
  title,
  headers,
  rows,
  footer,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  footer?: React.ReactNode;
}) {
  const isCopyable = (header: string) =>
    header.includes("Card Number") || header.includes("CVV") || header.includes("OTP");

  return (
     <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20  shadow-black/40 text-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 
             bg-clip-text text-transparent animate-gradient drop-shadow-lg 
             hover:drop-shadow-xl transition-all duration-300 ease-in-out">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-900/50">
                  {headers.map((header) => (
                    <TableHead key={header} className="text-lg font-semibold tracking-wide bg-gradient-to-r from-violet-500 via-purple-300 to-blue-500 
             bg-clip-text text-transparent animate-gradient transition-all duration-300 ease-in-out whitespace-nowrap px-4">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-slate-800 hover:bg-slate-900/50">
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="font-medium px-4 py-3">
                        <div className="flex justify-between items-center gap-3">
                           <span className={`min-w-0 ${isCopyable(headers[cellIndex]) ? 'font-mono' : 'break-words'}`}>
                             {cell}
                           </span>
                           {isCopyable(headers[cellIndex]) && <CopyButton text={cell} />}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {footer}
        </CardContent>
      </Card>
  );
}

// --- MAIN COMPONENT ---
export default function TestCards() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <Tabs defaultValue="razorpay" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-slate-800/80 rounded-lg p-1 h-10">
          <TabsTrigger
            value="razorpay"
            className="data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white rounded-md transition-all text-sm font-medium text-gray-300"
          >
            Razorpay X
          </TabsTrigger>
          <TabsTrigger
            value="payu"
            className="data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white rounded-md transition-all text-sm font-medium text-gray-300"
          >
            PayU
          </TabsTrigger>
        </TabsList>

        <TabsContent value="razorpay">
          <motion.div
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key="razorpay"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CardTable {...razorpayData.domestic} />
              </motion.div>
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CardTable {...razorpayData.international} />
              </motion.div>
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CardTable {...razorpayData.subscriptions}  />
              </motion.div>
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CardTable {...razorpayData.emi} />
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="payu">
          <motion.div
            className="w-full space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key="payu"
          >
            <motion.div variants={itemVariants}>
              <CardTable {...payuData.credit} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTable {...payuData.debit} />
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
