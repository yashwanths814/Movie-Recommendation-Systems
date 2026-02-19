"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/favorites");
    setItems(await res.json());
  }

  async function remove(imdbID: string) {
    await fetch(`/api/favorites?imdbID=${encodeURIComponent(imdbID)}`, { method: "DELETE" });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Favorites</h1>
      <Link href="/" style={{ display: "inline-block", marginTop: 8 }}>← Back</Link>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {items.map((m) => (
          <div key={m.imdbID} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
            <img src={m.poster || "/placeholder.png"} alt={m.title} style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 12 }} />
            <div style={{ marginTop: 8, fontWeight: 700 }}>{m.title}</div>
            <div style={{ opacity: 0.7 }}>{m.year}</div>
            <button onClick={() => remove(m.imdbID)} style={{ marginTop: 8, padding: "8px 10px" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
