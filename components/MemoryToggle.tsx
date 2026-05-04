"use client";

import { BookOpen, BookX } from "lucide-react";

interface MemoryToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function MemoryToggle({ enabled, onToggle }: MemoryToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? "Memória ativa — clique para desativar" : "Memória desativada — clique para guardar esta conversa"}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
      style={{
        background: enabled ? "var(--accent-light)" : "transparent",
        color: enabled ? "var(--accent)" : "var(--muted)",
        border: `1px solid ${enabled ? "var(--accent)" : "var(--border)"}`,
        fontFamily: "var(--font-inter)",
      }}
    >
      {enabled ? <BookOpen size={13} /> : <BookX size={13} />}
      {enabled ? "Guardando" : "Sem memória"}
    </button>
  );
}
