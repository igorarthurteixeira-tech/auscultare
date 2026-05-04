"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import { createProfile } from "@/lib/profile";

export default function SignUp() {
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
      const { user } = await signUp(email, password);
      try { await createProfile(user.uid); } catch { /* segue mesmo sem perfil */ }
      router.replace("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) setError("Este e-mail já está cadastrado.");
      else if (msg.includes("weak-password")) setError("A senha deve ter pelo menos 6 caracteres.");
      else setError("Não foi possível criar a conta. Tente novamente.");
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
            Criar conta
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
              placeholder="Senha (mín. 6 caracteres)"
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
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
          Já tem conta?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent)" }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
