"use client";

import { useState } from "react";
import Link from "next/link";

type OmdbSearchItem = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type?: string;
};

export default function HomePage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OmdbSearchItem[]>([]);
  const [error, setError] = useState<string>("");

  async function search() {
    const query = q.trim();
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);

      // ✅ Safe parsing (prevents "Unexpected end of JSON input")
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setResults([]);
        setError(data?.error || "Search failed");
        return;
      }

      const items: OmdbSearchItem[] = Array.isArray(data?.Search) ? data.Search : [];

      // ✅ DEDUPE to avoid "two children with the same key"
      const unique = Array.from(new Map(items.map((m) => [m.imdbID, m])).values());

      setResults(unique);
    } catch (e) {
      console.error(e);
      setResults([]);
      setError("Search failed. Check console / network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Movie App</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies… (e.g., Batman)"
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 10,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") search();
          }}
        />

        <button
          onClick={search}
          disabled={!q.trim() || loading}
          style={{ padding: "10px 14px" }}
        >
          {loading ? "Searching…" : "Search"}
        </button>

        <Link href="/favorites" style={{ padding: "10px 14px" }}>
          Favorites
        </Link>
      </div>

      {error ? (
        <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>
      ) : null}

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {results.map((m) => (
          <Link
            key={m.imdbID}
            href={`/movie/${m.imdbID}`}
            style={{
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 12,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              src={m.Poster !== "N/A" ? m.Poster : "/placeholder.png"}
              alt={m.Title}
              style={{
                width: "100%",
                height: 240,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
            <div style={{ marginTop: 8, fontWeight: 700 }}>{m.Title}</div>
            <div style={{ opacity: 0.7 }}>{m.Year}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
