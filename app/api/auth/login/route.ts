import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // In a real app, validate credentials against your database
    // For demo purposes, accept any email/password combination
    if (email && password) {
      return NextResponse.json({
        success: true,
        user: {
          id: "1",
          email,
          name: email.split("@")[0],
          isVerified: true,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
