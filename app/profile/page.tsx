"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, MessageSquare, Clock, CreditCard } from "lucide-react";
import { onAuthChange, sendPasswordReset } from "@/lib/auth";
import { getProfile, saveProfile, Profile } from "@/lib/profile";
import { getConversations } from "@/lib/conversations";

const AGE_RANGES = ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55+"];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function getTotalSessionTime() {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("auscultare_timer_")) {
      total += parseInt(localStorage.getItem(key) ?? "0", 10);
    }
  }
  return total;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [convCount, setConvCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [motivation, setMotivation] = useState("");
  const [aboutSelf, setAboutSelf] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (!user) { router.replace("/"); return; }
      setUserId(user.uid);
      setEmail(user.email);
      if (user.metadata.creationTime) {
        setMemberSince(new Date(user.metadata.creationTime).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
      }
      const p = await getProfile(user.uid);
      if (p) {
        setProfile(p);
        setName(p.name ?? "");
        setAgeRange(p.ageRange ?? "");
        setMotivation(p.motivation ?? "");
        setAboutSelf(p.aboutSelf ?? "");
      }
      const convs = await getConversations(user.uid);
      setConvCount(convs.length);
      setTotalTime(getTotalSessionTime());
    });
    return unsub;
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await saveProfile(userId, { name, ageRange, motivation, aboutSelf });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setResetError("");
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch {
      setResetError("Não foi possível enviar o e-mail. Tente novamente.");
    }
  };

  const initials = (name || email || "?").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}>
        <button onClick={() => router.back()} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={18} />
        </button>
        <span className="text-lg font-serif tracking-wide" style={{ color: "var(--accent)", fontFamily: "var(--font-cormorant)" }}>
          Perfil
        </span>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">

        {/* Avatar + identidade */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium shrink-0"
            style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-inter)" }}>
            {initials}
          </div>
          <div>
            <p className="font-medium" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
              {name || email?.split("@")[0]}
            </p>
            <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>{email}</p>
            {memberSince && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Membro desde {memberSince}
              </p>
            )}
          </div>
        </div>

        {/* Plano & Uso */}
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
            Plano & Uso
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>

            {/* Plano atual */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
              <div className="flex items-center gap-3">
                <CreditCard size={15} style={{ color: "var(--accent)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                  Plano atual
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: "var(--accent-light)", color: "var(--accent)", fontFamily: "var(--font-inter)" }}>
                Gratuito
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Tempo de sessão acumulado */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
              <div className="flex items-center gap-3">
                <Clock size={15} style={{ color: "var(--accent)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                    Tempo de sessão acumulado
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                    Total desde o início
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium tabular-nums" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                {totalTime > 0 ? formatTime(totalTime) : "—"}
              </p>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Tempo restante */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
              <div className="flex items-center gap-3">
                <Clock size={15} style={{ color: "var(--muted)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                    Tempo restante no plano
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                    Disponível neste período
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Ilimitado
              </p>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Conversas */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: "var(--card)" }}>
              <div className="flex items-center gap-3">
                <MessageSquare size={15} style={{ color: "var(--accent)" }} />
                <p className="text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                  Conversas salvas
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                {convCount}
              </p>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Upgrade */}
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Planos com horas contratadas e controle de sessão em breve.
              </p>
            </div>
          </div>
        </section>

        {/* Informações pessoais */}
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
            Informações pessoais
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {/* Nome */}
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como posso te chamar?"
                className="w-full text-sm bg-transparent outline-none"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}
              />
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Faixa etária */}
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <label className="text-xs mb-2 block" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Faixa etária
              </label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setAgeRange(r)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: ageRange === r ? "var(--accent)" : "var(--accent-light)",
                      color: ageRange === r ? "#fff" : "var(--accent)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Motivação */}
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                O que te trouxe até aqui
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={2}
                placeholder="O que te motivou a buscar esse espaço?"
                className="w-full text-sm bg-transparent outline-none resize-none"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}
              />
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Sobre si */}
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                Algo sobre você
              </label>
              <textarea
                value={aboutSelf}
                onChange={(e) => setAboutSelf(e.target.value)}
                rows={2}
                placeholder="O que quiser compartilhar..."
                className="w-full text-sm bg-transparent outline-none resize-none"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-inter)" }}
          >
            {saved ? <><Check size={14} /> Salvo</> : saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </section>

        {/* Conta */}
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
            Conta
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              <p className="text-xs mb-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>E-mail</p>
              <p className="text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>{email}</p>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            <div className="px-5 py-4" style={{ background: "var(--card)" }}>
              {resetSent ? (
                <p className="text-sm" style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}>
                  E-mail enviado. Verifique sua caixa de entrada.
                </p>
              ) : (
                <>
                  <button
                    onClick={handlePasswordReset}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
                  >
                    Redefinir senha por e-mail
                  </button>
                  {resetError && (
                    <p className="text-xs mt-1" style={{ color: "#c0392b", fontFamily: "var(--font-inter)" }}>{resetError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <div className="pb-8" />
      </div>
    </main>
  );
}
