import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { User } from "@/lib/Database/Models/User";
import { stockApi } from "@/lib/api/stock-api";
import { cryptoApi } from "@/lib/api/crypto-api";  // import cryptoApi

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const holdings = await Holding.find({ userId: user._id }).lean();

    const enriched = await Promise.all(
      holdings.map(async (h: any) => {
        try {
          let quote;
          if (h.sector?.toLowerCase() === "markets") {
            quote = await stockApi.getQuote(h.symbol);
          } else if (h.sector?.toLowerCase() === "crypto") {
            const cryptoQuote = await cryptoApi.getCryptoQuote(h.symbol);
            // merge and patch open and previousClose for crypto
            quote = {
              price: cryptoQuote.price ?? 0,
              change: cryptoQuote.change ?? 0,
              changePercent: cryptoQuote.changePercent ?? 0,
              volume: cryptoQuote.volume ?? 0,
              marketCap: cryptoQuote.marketCap ?? undefined,
              high: cryptoQuote.high ?? 0,
              low: cryptoQuote.low ?? 0,
              open:
                cryptoQuote.price !== undefined && cryptoQuote.change !== undefined
                  ? cryptoQuote.price - cryptoQuote.change
                  : 0,
              previousClose:
                cryptoQuote.price !== undefined && cryptoQuote.changePercent !== undefined
                  ? cryptoQuote.price / (1 + cryptoQuote.changePercent / 100)
                  : 0,
            };
          } else {
            quote = await stockApi.getQuote(h.symbol);
          }

          const currentValue = (h.quantity ?? 0) * (quote.price ?? 0);
          const profitLoss = currentValue - (h.totalInvested ?? 0);

          const history = await DailyPrice.find(
            { userId: user._id, symbol: h.symbol },
            {
              date: 1,
              sector: 1,
              close: 1,
              open: 1,
              high: 1,
              low: 1,
              volume: 1,
              marketCap: 1,
              change: 1,
              changePercent: 1,
              previousClose: 1,
              _id: 0,
            }
          ).sort({ date: 1 });

          return {
            ...h,
            _id: h._id.toString(),
            userId: h.userId.toString(),
            currentPrice: quote.price ?? 0,
            currentValue,
            profitLoss,
            profitLossPercent: h.totalInvested
              ? (profitLoss / h.totalInvested) * 100
              : 0,
            priceHistory: history,
          };
        } catch (e) {
          console.error(`Error fetching data for symbol ${h.symbol}:`, e);
          return {
            ...h,
            _id: h._id.toString(),
            userId: h.userId.toString(),
            currentPrice: null,
            currentValue: null,
            profitLoss: null,
            profitLossPercent: null,
            priceHistory: [],
            error: "Failed to fetch latest data",
          };
        }
      })
    );

    return NextResponse.json({ success: true, holdings: enriched }, { status: 200 });
  } catch (err) {
    console.error("GET /holdings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}
