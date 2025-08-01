import { connectToDatabase } from "@/lib/Database/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Transaction from "@/lib/Database/Models/Transaction";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
  }

  const userId = session.user.id;
  const transactions = await Transaction.find({ userId });

  // Sort by date ascending
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const balanceTrend: { date: string; balance: number }[] = [];
  const dailyPLHistory: { date: string; pnl: number }[] = [];
  const investmentDistribution: Record<string, number> = {};

  let runningBalance = 0;
  const plMap: Record<string, number> = {};

  for (const tx of transactions) {
   const date =
  tx.date && !isNaN(new Date(tx.date).getTime())
    ? new Date(tx.date).toISOString().split("T")[0]
    : "Invalid Date";

    if (tx.type === "deposit") {
      runningBalance += tx.amount;
    } else if (tx.type === "withdraw") {
      runningBalance -= tx.amount;
    } else if (tx.type === "buy") {
      runningBalance -= tx.amount;
      investmentDistribution[tx.symbol!] = (investmentDistribution[tx.symbol!] || 0) + tx.amount;
      plMap[date] = (plMap[date] || 0) - tx.amount;
    } else if (tx.type === "sell") {
      runningBalance += tx.amount;
      plMap[date] = (plMap[date] || 0) + tx.amount;
    }

    balanceTrend.push({ date, balance: runningBalance });
  }

  for (const [date, pnl] of Object.entries(plMap)) {
    dailyPLHistory.push({ date, pnl });
  }

  const formattedDistribution = Object.entries(investmentDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        investmentDistribution: formattedDistribution,
        balanceTrend,
        dailyPLHistory,
      },
    }),
    { status: 200 }
  );
}
