"use client";

import { useState } from "react";
import { getSaintOfTheDay } from "@/data/saints";

export default function SaintQuote() {
  const [revealed, setRevealed] = useState(false);
  const saint = getSaintOfTheDay();

  return (
    <div
      className="w-full max-w-lg mx-auto rounded-2xl px-6 py-5 text-center space-y-3"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Quote mark */}
      <span
        className="block text-4xl font-serif leading-none select-none"
        style={{ color: "var(--accent)", fontFamily: "var(--font-cormorant)" }}
        aria-hidden="true"
      >
        "
      </span>

      {/* Quote text */}
      <p
        className="leading-relaxed italic"
        style={{
          color: "var(--foreground)",
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.25rem",
          fontWeight: 500,
        }}
      >
        {saint.quote}
      </p>

      {/* Attribution */}
      <div className="pt-1">
        {revealed ? (
          <p
            className="text-sm font-medium transition-all duration-300"
            style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
          >
            — {saint.name}
          </p>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm transition-colors duration-200 underline underline-offset-4 cursor-pointer"
            style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
          >
            Revelar autor
          </button>
        )}
      </div>
    </div>
  );
}
