import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";

export async function updateHoldings(
  userId: string,
  symbol: string,
  quantity: number,
  close: number
) {
  await connectToDatabase();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const holding = await Holding.findOne({ userId: userObjectId, symbol });
  const quote = await stockApi.getQuote(symbol);
  const today = new Date();
  console.log("today:", today);
  if (holding) {
    const newQuantity = holding.quantity + quantity;

    if (newQuantity <= 0) {
      await Holding.deleteOne({ _id: holding._id });
      return;
    }

    const totalInvested = holding.totalInvested + quantity * close;
    holding.quantity = newQuantity;
    holding.totalInvested = totalInvested;
    holding.avgPrice = totalInvested / newQuantity;

    const alreadyExists = holding.priceHistory?.some(
      (p: { date: string | number | Date }) =>
        new Date(p.date).toDateString() === today.toDateString()
    );

    if (!alreadyExists) {
      holding.priceHistory.push({
        symbol: holding.symbol,
        date: today,
        close: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        previousClose: quote.previousClose,
        volume: quote.volume,
        marketCap: quote.marketCap,
      });
    }

    await holding.save();
  } else {
    if (quantity > 0) {
      await Holding.create({
        userId: userObjectId,
        symbol,
        quantity,
        avgPrice: close,
        totalInvested: quantity * close,
        buyDate: today,
        priceHistory: [
          {
            symbol,
            date: today,
            close: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            previousClose: quote.previousClose,
            volume: quote.volume,
            marketCap: quote.marketCap,
          },
        ],
      });

      try {
        const dailyPriceDoc = await DailyPrice.create({
          symbol,
          date: today,
          close: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
          volume: quote.volume,
          marketCap: quote.marketCap,
        });
        console.log("DailyPrice created:", dailyPriceDoc);
      } catch (error) {
        console.error("Error creating DailyPrice:", error);
      }
    }
  }
}
