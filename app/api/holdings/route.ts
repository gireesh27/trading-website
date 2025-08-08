import { getServerSession } from "next-auth";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi} from "@/lib/api/stock-api"; // Your Finnhub wrapper

export async function GET() {
  const session = await getServerSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const holdings = await Holding.find({ userId: session.user.id });

  const enriched = [];
  for (const h of holdings) {
    const quote = await stockApi.getQuote(h.symbol); 
    const currentValue = h.quantity * quote.price;
    const profitLoss = currentValue - h.totalInvested;

    enriched.push({
      symbol: h.symbol,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      totalInvested: h.totalInvested,
      currentPrice: quote.price,
      currentValue,
      profitLoss,
      profitLossPercent: (profitLoss / h.totalInvested) * 100,
    });
  }

  return new Response(JSON.stringify(enriched), { status: 200 });
}
