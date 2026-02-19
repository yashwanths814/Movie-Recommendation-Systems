"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#0b0b0f", color: "white" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/" style={{ color: "white" }}>← Back</Link>

        <h1 style={{ fontSize: 28, fontWeight: 950, marginTop: 16 }}>My Profile</h1>

        <div
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <p style={{ margin: 0, opacity: 0.85 }}>
            (Later we will show logged-in email here using session token decode.)
          </p>
        </div>
      </div>
    </main>
  );
}
