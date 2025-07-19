import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    // In a real app, verify OTP from your storage
    // For demo purposes, accept any 6-digit OTP
    if (phone && otp && otp.length === 6) {
      return NextResponse.json({
        success: true,
        user: {
          id: Date.now().toString(),
          phone,
          name: "Phone User",
          isVerified: true,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
