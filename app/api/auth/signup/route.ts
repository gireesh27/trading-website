import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // In a real app, create user in your database
    // For demo purposes, accept any valid data
    if (email && password && name) {
      return NextResponse.json({
        success: true,
        user: {
          id: Date.now().toString(),
          email,
          name,
          isVerified: false,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
