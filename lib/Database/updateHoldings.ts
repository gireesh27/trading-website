import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi } from "@/lib/api/stock-api";

export async function updateHoldings(
  userId: string,
  symbol: string,
  quantity: number,
  price: number
) {
  await connectToDatabase();
  console.log("updateHoldings called:", { userId, symbol, quantity, price });

  // Find existing holding
  const holding = await Holding.findOne({ userId, symbol });

  // Get latest market price (for history)
  const quote = await stockApi.getQuote(symbol);
  const today = new Date();

  if (holding) {
    // Update quantity and average price
    const newQuantity = holding.quantity + quantity;

    if (newQuantity <= 0) {
      // If all shares are sold, delete holding
      await Holding.deleteOne({ _id: holding._id });
      return;
    }

    const totalInvested = holding.totalInvested + quantity * price;

    holding.quantity = newQuantity;
    holding.totalInvested = totalInvested;
    holding.avgPrice = totalInvested / newQuantity;

    // Add today's price to history if not already there
    const alreadyExists = holding.priceHistory?.some(
      (p: { date: string | number | Date; }) => new Date(p.date).toDateString() === today.toDateString()
    );
    if (!alreadyExists) {
      holding.priceHistory.push({ date: today, price: quote.price });
    }

    await holding.save();
  } else {
    // Create new holding if buying
    if (quantity > 0) {
      await Holding.create({
        userId,
        symbol,
        quantity,
        avgPrice: price,
        totalInvested: quantity * price,
        priceHistory: [{ date: today, price: quote.price }],
      });
    }
  }
}
