// pages/api/watchlist/toggle-alert.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectDB();
    const { watchlistId, symbol, alertId, isActive, triggeredAt } = req.body;

    const updated = await Watchlist.findOneAndUpdate(
      { _id: watchlistId, "items.symbol": symbol },
      {
        $set: {
          "items.$[item].alerts.$[alert].isActive": isActive,
          "items.$[item].alerts.$[alert].triggeredAt": triggeredAt,
        },
      },
      {
        arrayFilters: [
          { "item.symbol": symbol },
          { "alert.id": alertId },
        ],
        new: true,
      }
    );

    return res.status(200).json({ success: true, updated });
  } catch (err) {
    console.error("Toggle alert error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
