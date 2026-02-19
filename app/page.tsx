"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type OmdbSearchItem = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type?: string;
};

type MovieCard = {
  imdbID: string;
  Title: string;
  Year?: string;
  Poster?: string;
  Genre?: string;
  imdbRating?: string;
};

// ✅ fallback (keeps UI clean, no 404)
const NO_POSTER_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
    <rect width="100%" height="100%" fill="#111"/>
  </svg>
`);

function normalizePosterUrl(poster?: string) {
  if (!poster || poster === "N/A") return NO_POSTER_DATA_URI;
  if (poster.startsWith("http://")) return poster.replace("http://", "https://");
  return poster;
}

const ROWS: { title: string; ids: string[] }[] = [
  {
    title: "Trending Now",
    ids: ["tt1375666", "tt0468569", "tt0133093", "tt4154796", "tt0111161", "tt0120737", "tt0816692", "tt0109830", "tt7286456", "tt2911666"],
  },
  {
    title: "Action",
    ids: ["tt2911666", "tt4154796", "tt1877830", "tt4154756", "tt0478970", "tt0103064", "tt0120815", "tt0110413"],
  },
  {
    title: "Comedy",
    ids: ["tt0107048", "tt0088763", "tt0103772", "tt0112384", "tt0110912", "tt0120888"],
  },
  {
    title: "Sci-Fi",
    ids: ["tt0816692", "tt0133093", "tt0080684", "tt0076759", "tt0120915", "tt1630029"],
  },
  {
    title: "Drama",
    ids: ["tt0111161", "tt0109830", "tt0068646", "tt0120689", "tt0114369", "tt0167260"],
  },
];

async function fetchMovieById(imdbID: string): Promise<MovieCard | null> {
  try {
    const res = await fetch(`/api/movies/${encodeURIComponent(imdbID)}`, { cache: "no-store" });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok || !data) return null;

    return {
      imdbID,
      Title: data.Title,
      Year: data.Year,
      Poster: data.Poster,
      Genre: data.Genre,
      imdbRating: data.imdbRating,
    };
  } catch {
    return null;
  }
}

function Row({ title, movies }: { title: string; movies: MovieCard[] }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 900 }}>{title}</h3>
        <span style={{ opacity: 0.6, fontSize: 12 }}>{movies.length ? `${movies.length} titles` : ""}</span>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
        {movies.map((m) => (
          <Link
            key={m.imdbID}
            href={`/movie/${m.imdbID}`}
            style={{
              minWidth: 170,
              width: 170,
              textDecoration: "none",
              color: "inherit",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ position: "relative", aspectRatio: "2 / 3", background: "rgba(255,255,255,0.05)" }}>
              <img
                src={normalizePosterUrl(m.Poster)}
                alt={m.Title}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.70), rgba(0,0,0,0) 60%)" }} />
              <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>{m.Title}</div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  {m.Year ? m.Year : ""} {m.imdbRating ? `• ⭐ ${m.imdbRating}` : ""}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** ✅ All hooks that use useSearchParams MUST be inside Suspense */
function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = (searchParams.get("q") || "").trim();

  const [q, setQ] = useState(urlQ);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OmdbSearchItem[]>([]);
  const [error, setError] = useState<string>("");

  const [homeLoading, setHomeLoading] = useState(false);
  const [homeRows, setHomeRows] = useState<Record<string, MovieCard[]>>({});

  const [menuOpen, setMenuOpen] = useState(false);

  const hasQuery = useMemo(() => q.trim().length > 0, [q]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  async function search(query?: string) {
    const finalQuery = (query ?? q).trim();
    if (!finalQuery) return;

    router.push(`/?q=${encodeURIComponent(finalQuery)}`);

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(finalQuery)}`, { cache: "no-store" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setResults([]);
        setError(data?.error || "Search failed");
        return;
      }

      const items: OmdbSearchItem[] = Array.isArray(data?.Search) ? data.Search : [];
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

  // when URL changes
  useEffect(() => {
    setQ(urlQ);
    if (urlQ) search(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]);

  // load home rows (when no search)
  useEffect(() => {
    if (urlQ) return;

    let cancelled = false;
    (async () => {
      setHomeLoading(true);
      try {
        const rowData: Record<string, MovieCard[]> = {};
        for (const row of ROWS) {
          const movies = await Promise.all(row.ids.map(fetchMovieById));
          rowData[row.title] = movies.filter(Boolean) as MovieCard[];
        }
        if (!cancelled) setHomeRows(rowData);
      } finally {
        if (!cancelled) setHomeLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlQ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 600px at 20% 10%, rgba(255,0,0,0.20), transparent 60%), #0b0b0f",
        color: "white",
      }}
      onClick={() => {
        if (menuOpen) setMenuOpen(false);
      }}
    >
      {/* TOP NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(10px)",
          background: "rgba(11,11,15,0.65)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.6, fontSize: 18, color: "#e50914" }}>MOVIEFLIX</div>
          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/favorites"
              style={{
                textDecoration: "none",
                color: "white",
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                fontWeight: 700,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Favorites
            </Link>

            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 999, background: "rgba(229,9,20,0.9)", display: "grid", placeItems: "center", fontWeight: 900 }}>
                  U
                </div>
                <span style={{ opacity: 0.9 }}>Profile</span>
                <span style={{ opacity: 0.7 }}>{menuOpen ? "▲" : "▼"}</span>
              </button>

              {menuOpen ? (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 10,
                    width: 180,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,10,14,0.95)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href="/profile"
                    style={{
                      display: "block",
                      padding: "12px 12px",
                      textDecoration: "none",
                      color: "white",
                      fontWeight: 700,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Profile
                  </Link>

                  <button
                    onClick={logout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 12px",
                      border: "none",
                      background: "transparent",
                      color: "#ff6b6b",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 10px" }}>
        <div
          style={{
            borderRadius: 22,
            padding: 22,
            background: "linear-gradient(135deg, rgba(229,9,20,0.22), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 950, lineHeight: 1.05 }}>{urlQ ? `Search: ${urlQ}` : "Welcome to MovieFlix"}</h1>

          <p style={{ margin: "10px 0 0", opacity: 0.82, maxWidth: 700 }}>
            Netflix-style home: trending + genres. Search any movie to see posters instantly.
          </p>

          <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "10px 12px" }}>
            <span style={{ opacity: 0.8 }}>🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies… (e.g., Batman, Avatar, Pushpa)"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "white", fontSize: 15 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") search();
              }}
            />

            <button
              onClick={() => search()}
              disabled={!hasQuery || loading}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "none",
                fontWeight: 900,
                cursor: !hasQuery || loading ? "not-allowed" : "pointer",
                opacity: !hasQuery || loading ? 0.55 : 1,
                background: "#e50914",
                color: "white",
              }}
            >
              {loading ? "Searching…" : "Search"}
            </button>

            {urlQ ? (
              <button
                type="button"
                onClick={() => router.push("/")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            ) : null}
          </div>

          {error ? <p style={{ marginTop: 12, color: "#ff6b6b", fontWeight: 700 }}>{error}</p> : null}
        </div>
      </section>

      {/* BODY */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px 40px" }}>
        {urlQ ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h2 style={{ margin: "12px 0", fontSize: 18, fontWeight: 900 }}>{`Results for “${urlQ}”`}</h2>
              <div style={{ opacity: 0.7, fontSize: 13 }}>{results.length ? `${results.length} items` : ""}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
              {results.map((m) => (
                <Link
                  key={m.imdbID}
                  href={`/movie/${m.imdbID}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "2 / 3", background: "rgba(255,255,255,0.05)" }}>
                    <img
                      src={normalizePosterUrl(m.Poster)}
                      alt={m.Title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 60%)" }} />
                    <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                      <div style={{ fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>{m.Title}</div>
                      <div style={{ opacity: 0.75, fontSize: 12 }}>
                        {m.Year} {m.Type ? `• ${m.Type}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!loading && results.length === 0 && !error ? <p style={{ marginTop: 14, opacity: 0.75 }}>No results found.</p> : null}
          </>
        ) : (
          <>
            {homeLoading ? <p style={{ opacity: 0.75 }}>Loading home rows…</p> : ROWS.map((row) => <Row key={row.title} title={row.title} movies={homeRows[row.title] || []} />)}
          </>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  // ✅ Suspense fixes prerender error caused by useSearchParams()
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#0b0b0f", color: "white", display: "grid", placeItems: "center" }}>
          Loading…
        </main>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
