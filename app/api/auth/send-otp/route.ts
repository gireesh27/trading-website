import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // In a real app, integrate with SMS service like Twilio
    // For demo purposes, simulate OTP sending
    if (phone) {
      // Generate and store OTP (in real app, use Redis or database)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      console.log(`OTP for ${phone}: ${otp}`) // In real app, send via SMS

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      })
    }

    return NextResponse.json({ success: false, message: "Phone number required" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
