import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 });
    }

    const deleted = await Watchlist.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Watchlist deleted successfully." });
  } catch (err: any) {
    console.error("❌ Error deleting watchlist:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
