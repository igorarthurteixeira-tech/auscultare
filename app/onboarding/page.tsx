"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { saveProfile } from "@/lib/profile";

const steps = [
  {
    key: "name",
    question: "Como você gostaria de ser chamado?",
    placeholder: "Seu nome ou apelido",
    type: "text",
  },
  {
    key: "ageRange",
    question: "Qual é a sua faixa etária?",
    placeholder: "",
    type: "select",
    options: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55 ou mais"],
  },
  {
    key: "motivation",
    question: "O que te trouxe até aqui?",
    placeholder: "Pode ser breve, não há resposta certa...",
    type: "textarea",
  },
  {
    key: "aboutSelf",
    question: "Há algo que você gostaria que eu soubesse sobre você?",
    placeholder: "Algo que considera importante, ou que sente que poucos percebem...",
    type: "textarea",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) router.replace("/auth/login");
      else setUserId(user.uid);
    });
    return unsub;
  }, [router]);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
    setValue("");
    setStep((s) => s + 1);
  };

  const handleSkipAll = async () => {
    if (!userId) return;
    setLoading(true);
    await saveProfile(userId, { onboardingCompleted: true });
    router.replace("/chat");
  };

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);
    const finalAnswers = { ...answers, [current.key]: value, onboardingCompleted: true };
    await saveProfile(userId, finalAnswers);
    router.replace("/chat");
  };

  if (!userId) return null;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p
            className="text-sm tracking-[0.2em] uppercase"
            style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
          >
            Auscultare
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
          >
            Essas perguntas me ajudam a entender melhor quem você é — mas são todas opcionais.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h2
            className="text-2xl font-serif font-light"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--foreground)" }}
          >
            {current.question}
          </h2>

          {current.type === "select" ? (
            <div className="grid grid-cols-2 gap-2">
              {current.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setValue(opt)}
                  className="py-2.5 px-4 rounded-xl text-sm text-left transition-all duration-150"
                  style={{
                    background: value === opt ? "var(--accent)" : "var(--card)",
                    color: value === opt ? "#fff" : "var(--foreground)",
                    border: `1px solid ${value === opt ? "var(--accent)" : "var(--border)"}`,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : current.type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={current.placeholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-inter)",
              }}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={current.placeholder}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-inter)",
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={isLast ? handleFinish : handleNext}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {isLast ? "Começar" : "Continuar"}
          </button>
          <button
            onClick={isLast ? handleFinish : handleNext}
            disabled={loading}
            className="py-3 px-4 rounded-xl text-sm transition-opacity hover:opacity-70"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Pular
          </button>
        </div>

        {step === 0 && (
          <p
            className="text-center text-xs cursor-pointer hover:underline"
            style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
            onClick={handleSkipAll}
          >
            Pular tudo e começar agora
          </p>
        )}
      </div>
    </main>
  );
}
