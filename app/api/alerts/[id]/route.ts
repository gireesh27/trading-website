// File: /app/api/alerts/[id]/route.ts
import { connectToDatabase } from "@/lib/Database/mongodb";
import { AlertModel } from "@/lib/Database/Models/Alert";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const updated = await AlertModel.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ success: true, alert: updated });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await AlertModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid alert ID" }, { status: 400 });
    }

    const alert = await AlertModel.findById(id);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, alert });
  } catch (err: any) {
    console.error("GET alert by ID error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}