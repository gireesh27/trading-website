import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";
import { cryptoApi } from "@/lib/api/crypto-api";

export async function updateHoldings(
  userId: string,
  symbol: string,
  quantity: number,
  close: number,
  sector: string
) {
  try {
    await connectToDatabase();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch holding
    const holding = await Holding.findOne({ userId: userObjectId, symbol });

    // Get latest quote depending on sector
    let quote: any;
    if (sector.toLowerCase() === "markets") {
      console.log(sector.toLowerCase());
      quote = await stockApi.getQuote(symbol);
    }
    else if (sector.toLowerCase() === "crypto") {
      console.log(sector.toLowerCase());
      quote = await cryptoApi.getCryptoQuote(symbol);

      // Assign all properties consistently
      quote = {
        symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changePercent || 0,
        volume: quote.volume || 0,
        marketCap: quote.marketCap || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        open:
          quote.price && quote.change !== undefined
            ? quote.price - quote.change
            : 0,
        previousClose:
          quote.price && quote.changePercent !== undefined
            ? quote.price / (1 + quote.changePercent / 100)
            : 0,
      };
    }


    if (!quote) {
      console.error(`No quote data for ${symbol}`);
      return;
    }

    const today = new Date();

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

      // Ensure priceHistory exists
      if (!holding.priceHistory) holding.priceHistory = [];

      const alreadyExists = holding.priceHistory.some(
        (p: { date: Date }) =>
          new Date(p.date).toDateString() === today.toDateString()
      );

      if (!alreadyExists) {
        holding.priceHistory.push({
          symbol: holding.symbol,
          sector,
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
          sector,
          quantity,
          avgPrice: close,
          totalInvested: quantity * close,
          buyDate: today,
          priceHistory: [
            {
              symbol,
              sector,
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
            sector,
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
  } catch (err) {
    console.error("Error updating holdings:", err);
  }
}
