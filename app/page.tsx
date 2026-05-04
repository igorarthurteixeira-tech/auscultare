"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import Link from "next/link";

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) router.replace("/chat");
    });
    return unsub;
  }, [router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="flex flex-col items-center gap-8 max-w-md w-full text-center">
        <p
          className="text-sm tracking-[0.25em] uppercase"
          style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
        >
          Auscultare
        </p>

        <div className="space-y-3">
          <h1
            className="text-5xl md:text-6xl font-serif font-light"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}
          >
            Um espaço para se ouvir.
          </h1>
          <p
            className="text-base font-light"
            style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
          >
            Conversas que levam ao autoconhecimento, com presença e sem julgamento.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/auth/signup"
            className="w-full py-3 rounded-xl text-sm font-medium text-center transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
            }}
          >
            Criar conta
          </Link>
          <Link
            href="/auth/login"
            className="w-full py-3 rounded-xl text-sm font-medium text-center transition-opacity hover:opacity-90"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
