import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import { Wallet } from "@/lib/Database/Models/Wallet";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.walletBalance += amount; // ✅ Set directly
    await user.save(); // ✅ Persist change

    // Update Wallet (create if missing)
    const wallet = await Wallet.findOneAndUpdate(
      { userId: user._id },
      { $inc: { walletBalance: amount } }, // ✅ fix here
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, walletBalance: wallet.walletBalance },
      { status: 200 }
    );
  } catch (err) {
    console.error("Wallet credit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
