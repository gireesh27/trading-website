import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi } from "@/lib/api/stock-api"; // Your API wrapper (Finnhub/Yahoo)

export async function GET() {
  try {
    await connectToDatabase();

    const holdings = await Holding.find({});
    const today = new Date();

    let updatedCount = 0;

    for (const holding of holdings) {
      const quote = await stockApi.getQuote(holding.symbol);

      const alreadyExists = holding.priceHistory?.some(
        (p: { date: string | number | Date; }) => new Date(p.date).toDateString() === today.toDateString()
      );

      if (!alreadyExists) {
        holding.priceHistory.push({
          date: today,
          price: quote.price,
        });
        await holding.save();
        updatedCount++;
      }
    }

    return Response.json({
      success: true,
      updated: updatedCount,
      totalHoldings: holdings.length
    });
  } catch (error: any) {
    console.error("Error updating holdings:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
