import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // In a real app, send password reset email
    // For demo purposes, simulate email sending
    if (email) {
      console.log(`Password reset link sent to: ${email}`)

      return NextResponse.json({
        success: true,
        message: "Password reset link sent",
      })
    }

    return NextResponse.json({ success: false, message: "Email required" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
