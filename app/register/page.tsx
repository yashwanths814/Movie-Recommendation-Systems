"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const rules = useMemo(() => validatePassword(pw), [pw]);
  const allOk = Object.values(rules).every(Boolean);
  const matchOk = pw.length > 0 && pw === confirmPw;

  const canSubmit = email.trim() && allOk && matchOk && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !allOk || !matchOk) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: pw }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setErr(data?.error || "Registration failed");
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");
      setEmail("");
      setPw("");
      setConfirmPw("");

      setTimeout(() => router.push("/login"), 900);
    } catch (e) {
      console.error(e);
      setErr("Registration failed. Check your internet / server.");
    } finally {
      setLoading(false);
    }
  }

  const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center", opacity: ok ? 1 : 0.6 }}>
      <span style={{ fontWeight: 900 }}>{ok ? "✅" : "⬜"}</span>
      <span>{text}</span>
    </div>
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#0b0b0f",
        color: "white",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Register</h1>
        <p style={{ marginTop: 0, opacity: 0.75 }}>Create your account</p>

        <label style={{ display: "block", marginTop: 14, fontWeight: 700 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
          required
        />

        <label style={{ display: "block", marginTop: 14, fontWeight: 700 }}>Password</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Create a strong password"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              cursor: "pointer",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <label style={{ display: "block", marginTop: 14, fontWeight: 700 }}>Confirm Password</label>
        <input
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          type={show ? "text" : "password"}
          placeholder="Re-enter password"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: `1px solid ${
              confirmPw.length === 0 ? "rgba(255,255,255,0.15)" : matchOk ? "#22c55e" : "#ef4444"
            }`,
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
          required
        />

        {!matchOk && confirmPw.length > 0 && (
          <p style={{ color: "#ff6b6b", marginTop: 8, marginBottom: 0, fontWeight: 700 }}>
            Passwords do not match
          </p>
        )}

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Password must include:</div>
          <Rule ok={rules.length} text="At least 8 characters" />
          <Rule ok={rules.upper} text="1 uppercase letter (A-Z)" />
          <Rule ok={rules.lower} text="1 lowercase letter (a-z)" />
          <Rule ok={rules.number} text="1 number (0-9)" />
          <Rule ok={rules.special} text="1 special character (@#$...)" />
        </div>

        {err ? (
          <p style={{ color: "#ff6b6b", marginTop: 12, fontWeight: 800 }}>{err}</p>
        ) : null}

        {success ? (
          <p style={{ color: "#22c55e", marginTop: 12, fontWeight: 800 }}>{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 12,
            borderRadius: 14,
            border: "none",
            fontWeight: 900,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.55,
            background: "#e50914",
            color: "white",
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p style={{ marginTop: 14, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "white", fontWeight: 900 }}>
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
