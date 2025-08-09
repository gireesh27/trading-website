import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { User } from "@/lib/Database/Models/User";
import { stockApi } from "@/lib/api/stock-api";

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
          const quote = await stockApi.getQuote(h.symbol);
          const currentValue = h.quantity * quote.price;
          const profitLoss = currentValue - h.totalInvested;

          const history = await DailyPrice.find(
            { userId: user._id, symbol: h.symbol },
            {
              date: 1,
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
            currentPrice: quote.price,
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
