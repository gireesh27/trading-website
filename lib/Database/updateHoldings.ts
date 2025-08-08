import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";

export async function updateHoldings(userId:string, symbol:string, quantity:number, price:number) {
  await connectToDatabase();
  console.log("updateHoldings called:", { userId, symbol, quantity, price });
  // Find existing holding
  const holding = await Holding.findOne({ userId, symbol });

  if (holding) {
    // Update quantity and average price
    const newQuantity = holding.quantity + quantity;

    if (newQuantity <= 0) {
      // If all shares are sold, delete holding
      await Holding.deleteOne({ _id: holding._id });
      return;
    }

    const totalInvested =
      holding.totalInvested + quantity * price;

    holding.quantity = newQuantity;
    holding.totalInvested = totalInvested;
    holding.avgPrice = totalInvested / newQuantity;

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
      });
    }
  }
}
