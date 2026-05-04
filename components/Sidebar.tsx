"use client";

import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Trash2, AlertTriangle, Pencil, Check, Pin, PinOff } from "lucide-react";
import { Conversation } from "@/lib/conversations";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function ConversationItem({
  conv,
  currentId,
  pinnedCount,
  onSelect,
  onClose,
  onRename,
  onDelete,
  onPin,
}: {
  conv: Conversation;
  currentId: string | null;
  pinnedCount: number;
  onSelect: (id: string) => void;
  onClose: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(conv.preview);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const confirmRename = () => {
    const trimmed = editValue.trim();
    if (trimmed) onRename(conv.id, trimmed);
    setEditing(false);
  };

  const canPin = !conv.pinned && pinnedCount >= 3;

  if (confirming) {
    return (
      <div className="mx-2 my-1 rounded-xl px-3 py-3 space-y-2"
        style={{ background: "var(--accent-light)", border: "1px solid var(--accent)" }}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
            Esta conversa será <strong>apagada permanentemente</strong> e não poderá ser recuperada.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onDelete(conv.id); setConfirming(false); }}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-inter)" }}>
            Apagar
          </button>
          <button onClick={() => setConfirming(false)}
            className="flex-1 py-1.5 rounded-lg text-xs"
            style={{ background: "var(--border)", color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <MessageCircle size={14} className="shrink-0" style={{ color: "var(--accent)" }} />
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmRename();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 text-xs px-2 py-1 rounded-lg outline-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--accent)",
            color: "var(--foreground)",
            fontFamily: "var(--font-inter)",
          }}
        />
        <button onClick={confirmRename} style={{ color: "var(--accent)" }}>
          <Check size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group flex items-start gap-3 px-4 py-3"
      style={{
        background: conv.id === currentId ? "var(--accent-light)" : "transparent",
        borderLeft: conv.id === currentId ? "2px solid var(--accent)" : "2px solid transparent",
      }}
    >
      <button
        className="flex items-start gap-3 flex-1 min-w-0 text-left"
        onClick={() => { onSelect(conv.id); onClose(); }}
      >
        <MessageCircle size={14} className="mt-0.5 shrink-0"
          style={{ color: conv.id === currentId ? "var(--accent)" : "var(--muted)" }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate"
            style={{ color: conv.id === currentId ? "var(--accent)" : "var(--foreground)", fontFamily: "var(--font-inter)" }}>
            {conv.preview}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
            {formatDate(conv.createdAt)}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          title="Renomear" style={{ color: "var(--muted)" }}>
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPin(conv.id, !conv.pinned); }}
          title={conv.pinned ? "Desafixar" : canPin ? "Limite de 3 fixadas atingido" : "Fixar"}
          style={{ color: conv.pinned ? "var(--accent)" : "var(--muted)", opacity: canPin ? 0.35 : 1 }}
          disabled={canPin}
        >
          {conv.pinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
          title="Apagar" style={{ color: "var(--muted)" }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, conversations, currentId, onSelect, onDelete, onRename, onPin }: SidebarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const pinned = conversations.filter((c) => c.pinned);
  const rest = conversations.filter((c) => !c.pinned);
  const pinnedCount = pinned.length;

  return (
    <>
      <div className="fixed inset-0 z-20 transition-opacity duration-300"
        style={{ background: "rgba(28,26,24,0.3)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }} />

      <div ref={ref}
        className="fixed top-0 left-0 z-30 h-full flex flex-col transition-transform duration-300"
        style={{
          width: "280px",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)" }}>
            Conversas
          </span>
          <button onClick={onClose} style={{ color: "var(--muted)" }}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-center px-4 py-8" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
              Nenhuma conversa ainda.
            </p>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="text-xs px-4 py-1 uppercase tracking-wider"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                    Fixadas
                  </p>
                  {pinned.map((conv) => (
                    <ConversationItem key={conv.id} conv={conv} currentId={currentId}
                      pinnedCount={pinnedCount} onSelect={onSelect} onClose={onClose}
                      onRename={onRename} onDelete={onDelete} onPin={onPin} />
                  ))}
                  {rest.length > 0 && (
                    <div className="my-2 mx-4 border-t" style={{ borderColor: "var(--border)" }} />
                  )}
                </>
              )}
              {rest.map((conv) => (
                <ConversationItem key={conv.id} conv={conv} currentId={currentId}
                  pinnedCount={pinnedCount} onSelect={onSelect} onClose={onClose}
                  onRename={onRename} onDelete={onDelete} onPin={onPin} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
