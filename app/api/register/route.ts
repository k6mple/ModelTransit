import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { userName, email, password } = await req.json()

    if (!userName || !email || !password) {
      return NextResponse.json(
        { code: 0, message: "Username, email and password are required" },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { code: 0, message: "Email already registered" },
        { status: 409 },
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const id = uuidv4()
    await prisma.user.create({
      data: { id, userName, email, password: hashed },
    })

    return NextResponse.json({ code: 1, message: "Registration successful" })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { code: -1, message: "Internal server error" },
      { status: 500 },
    )
  }
}
