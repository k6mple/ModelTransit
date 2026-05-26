import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { code: 0, message: "Email and password are required" },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { code: 0, message: "Wrong account or password" },
      )
    }

    // TODO: use bcrypt when registration is implemented
    if (user.password !== password) {
      return NextResponse.json(
        { code: 0, message: "Wrong account or password" },
      )
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" },
    )

    return NextResponse.json({ code: 1, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { code: -1, message: "Internal server error" },
      { status: 500 },
    )
  }
}
