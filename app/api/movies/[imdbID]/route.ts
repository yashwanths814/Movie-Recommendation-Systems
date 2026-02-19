import { NextResponse } from "next/server";
import { omdbById } from "../../../lib/omdb";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ imdbID: string }> }
) {
  try {
    // ✅ FIX: params is a Promise in your Next.js version
    const { imdbID } = await ctx.params;
    const id = (imdbID || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing imdbID" }, { status: 400 });
    }

    const data = await omdbById(id);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch movie" },
      { status: 500 }
    );
  }
}
