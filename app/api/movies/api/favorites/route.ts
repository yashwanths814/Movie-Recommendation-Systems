import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const favorites = await prisma.favorite.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { imdbID, Title, Poster, Year, Type } = body;

  if (!imdbID || !Title)
    return NextResponse.json({ error: "Missing imdbID/Title" }, { status: 400 });

  const fav = await prisma.favorite.upsert({
    where: { imdbID },
    create: { imdbID, title: Title, poster: Poster, year: Year, type: Type },
    update: { title: Title, poster: Poster, year: Year, type: Type },
  });

  return NextResponse.json(fav);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const imdbID = searchParams.get("imdbID");
  if (!imdbID) return NextResponse.json({ error: "Missing imdbID" }, { status: 400 });

  await prisma.favorite.delete({ where: { imdbID } });
  return NextResponse.json({ ok: true });
}
