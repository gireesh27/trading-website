// File: /app/api/alerts/[id]/route.ts
import { connectToDatabase } from "@/lib/Database/mongodb";
import { AlertModel } from "@/lib/Database/Models/Alert";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// Format alert for frontend: replace _id with id
function formatAlert(alert: any) {
  if (!alert) return null;
  const obj = alert.toObject ? alert.toObject() : alert;
  return { ...obj, id: obj._id.toString() };
}

// ✅ PATCH - Update alert
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const updated = await AlertModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, alert: formatAlert(updated) });
  } catch (err) {
    console.error("PATCH alert error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ DELETE - Remove alert
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const deletedAlert = await AlertModel.findByIdAndDelete(id);
    if (!deletedAlert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
      alert: formatAlert(deletedAlert),
    });
  } catch (err) {
    console.error("Error deleting alert:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ GET - Get alert by ID
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

    return NextResponse.json({ success: true, alert: formatAlert(alert) });
  } catch (err: any) {
    console.error("GET alert by ID error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
