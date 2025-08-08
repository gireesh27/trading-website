import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/lib/Database/Models/User";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


  const user = await User.findOne({ email: session.user.email });
  console.log("user:", user._id);
  if (!user) {
    console.log("User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    console.log("symbol:", symbol);
    if (!symbol) {
      console.log("Symbol is required");
      return NextResponse.json(
        { success: false, message: "Symbol is required" },
        { status: 400 }
      );
    }

    const query: any = { symbol };

    if (user._id) {
      // Validate userId is a valid ObjectId string
      if (!mongoose.Types.ObjectId.isValid(user._id)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId" },
          { status: 400 }
        );
      }
      query.userId = new mongoose.Types.ObjectId(user._id);
    }

    const holding = await Holding.findOne(query);

    if (!holding) {
      return NextResponse.json(
        { success: false, message: "Holding not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      symbol,
      priceHistory: holding.priceHistory || [],
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
