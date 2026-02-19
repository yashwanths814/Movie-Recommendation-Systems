import { NextResponse } from "next/server";
import { omdbSearch } from "../../../lib/omdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ Search: [], totalResults: "0" }, { status: 200 });
    }

    const data = await omdbSearch(q);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to search movies" },
      { status: 500 }
    );
  }
}
