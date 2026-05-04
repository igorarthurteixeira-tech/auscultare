"use client";

import { useState } from "react";
import { X, Clock } from "lucide-react";
import { PLANS } from "@/lib/plans";

interface PlanModalProps {
  userId: string;
  onClose: () => void;
}

export default function PlanModal({ userId, onClose }: PlanModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId, origin: window.location.origin }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(28,26,24,0.6)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-lg font-serif" style={{ color: "var(--accent)", fontFamily: "var(--font-cormorant)" }}>
              Continuar conversando
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
              Escolha um pacote de horas
            </p>
          </div>
          <button onClick={onClose} className="transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Plans */}
        <div className="p-4 space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              disabled={!!loading}
              className="w-full rounded-2xl px-5 py-4 text-left flex items-center justify-between transition-all hover:opacity-90"
              style={{
                background: plan.highlight ? "var(--accent)" : "var(--card)",
                border: plan.highlight ? "none" : "1px solid var(--border)",
                opacity: loading && loading !== plan.id ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <Clock size={15} style={{ color: plan.highlight ? "#fff" : "var(--accent)" }} />
                <div>
                  <p className="text-sm font-medium"
                    style={{ color: plan.highlight ? "#fff" : "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                    {plan.name}
                  </p>
                  <p className="text-xs"
                    style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "var(--muted)", fontFamily: "var(--font-inter)" }}>
                    {plan.description}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium shrink-0 ml-4"
                style={{ color: plan.highlight ? "#fff" : "var(--foreground)", fontFamily: "var(--font-inter)" }}>
                {loading === plan.id ? "..." : `R$ ${(plan.price / 100).toFixed(2).replace(".", ",")}`}
              </p>
            </button>
          ))}
        </div>

        <p className="text-center text-xs pb-5" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
          Pagamento seguro via Stripe · Cartão ou Pix
        </p>
      </div>
    </div>
  );
}
