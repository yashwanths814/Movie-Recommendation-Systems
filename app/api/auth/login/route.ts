import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/db";
import { signToken } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = (body?.email || "").toString().trim().toLowerCase();
    const password = (body?.password || "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // optional: basic email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
