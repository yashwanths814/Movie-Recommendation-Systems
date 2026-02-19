"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") || "/";

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setErr(data?.error || "Login failed");
        return;
      }

      router.push(from); // ✅ after login go to home page
    } catch (e) {
      console.error(e);
      setErr("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#0b0b0f", color: "white" }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Login</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>Welcome back</p>

        <label style={{ display: "block", marginTop: 14, fontWeight: 700 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
          style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "white" }}
          required />

        <label style={{ display: "block", marginTop: 14, fontWeight: 700 }}>Password</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"}
            style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "white" }}
            required />
          <button type="button" onClick={() => setShow((s) => !s)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "white" }}>
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {err ? <p style={{ color: "#ff6b6b", marginTop: 10, fontWeight: 700 }}>{err}</p> : null}

        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 16, padding: 12, borderRadius: 14, border: "none", fontWeight: 900, background: "#e50914", color: "white" }}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <p style={{ marginTop: 14, marginBottom: 0 }}>
          New user? <Link href="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
}
