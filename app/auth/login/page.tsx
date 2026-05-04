"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      const profile = await getProfile(user.uid);
      if (profile && !profile.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/chat");
      }
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <p
            className="text-sm tracking-[0.2em] uppercase"
            style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
          >
            Auscultare
          </p>
          <h1
            className="text-3xl font-serif font-light"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}
          >
            Bem-vindo de volta.
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-inter)",
              }}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-inter)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "#c0392b", fontFamily: "var(--font-inter)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
          Não tem conta?{" "}
          <Link href="/auth/signup" style={{ color: "var(--accent)" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
