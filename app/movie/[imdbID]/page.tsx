"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MovieDetailsPage() {
  const { imdbID } = useParams<{ imdbID: string }>();
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/movies/${imdbID}`);
      setData(await res.json());
    })();
  }, [imdbID]);

  async function addFav() {
    setSaving(true);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    alert("Added to favorites!");
  }

  if (!data) return <main style={{ padding: 24 }}>Loading…</main>;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>{data.Title}</h1>
      <p style={{ opacity: 0.8 }}>{data.Year} • {data.Runtime} • {data.Genre}</p>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, marginTop: 16 }}>
        <img
          src={data.Poster !== "N/A" ? data.Poster : "/placeholder.png"}
          alt={data.Title}
          style={{ width: "100%", borderRadius: 14 }}
        />
        <div>
          <p><b>Plot:</b> {data.Plot}</p>
          <p><b>Actors:</b> {data.Actors}</p>
          <p><b>IMDb:</b> {data.imdbRating}</p>

          <button onClick={addFav} disabled={saving} style={{ marginTop: 10, padding: "10px 14px" }}>
            {saving ? "Saving…" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </main>
  );
}
