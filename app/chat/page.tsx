"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, LogOut, Menu, EyeOff } from "lucide-react";
import { onAuthChange, signOut } from "@/lib/auth";
import { getProfile, createProfile, Profile } from "@/lib/profile";
import {
  createConversation,
  saveMessage,
  loadMessages,
  getConversations,
  deleteConversation,
  updateConversationTitle,
  togglePinConversation,
  Message,
  Conversation,
} from "@/lib/conversations";
import { windowMessages } from "@/lib/memory";
import { getBalance, initFreeTrialIfNeeded, deductBalance } from "@/lib/balance";
import { WARNING_SECONDS, URGENT_SECONDS } from "@/lib/plans";
import Greeting from "@/components/Greeting";
import SaintQuote from "@/components/SaintQuote";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import Sidebar from "@/components/Sidebar";
import PlanModal from "@/components/PlanModal";

export default function Chat() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionOffset, setSessionOffset] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDeductRef = useRef<number>(0);
  const hasMessages = messages.length > 0 || isLoading;
  const balanceExhausted = balance !== null && balance <= 0;
  const balanceWarning = balance !== null && balance > 0 && balance <= WARNING_SECONDS;
  const balanceUrgent = balance !== null && balance > 0 && balance <= URGENT_SECONDS;

  const pauseTimer = (convId: string | null) => {
    if (!convId || !sessionStart) return;
    const total = sessionOffset + Math.floor((Date.now() - sessionStart) / 1000);
    localStorage.setItem(`auscultare_timer_${convId}`, String(total));
    setSessionStart(null);
  };

  const resumeTimer = (convId: string) => {
    const saved = parseInt(localStorage.getItem(`auscultare_timer_${convId}`) ?? "0", 10);
    setSessionOffset(saved);
    setSessionStart(Date.now());
  };

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (!user) { router.replace("/"); return; }
      setUserId(user.uid);
      setUserEmail(user.email);
      let p = await getProfile(user.uid);
      if (!p) {
        await createProfile(user.uid);
        p = { onboardingCompleted: false };
      }
      setProfile(p);
      const convs = await getConversations(user.uid);
      setConversations(convs);
      await initFreeTrialIfNeeded(user.uid);
      const bal = await getBalance(user.uid);
      setBalance(bal);

      // verifica se voltou de pagamento bem-sucedido
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        const newBal = await getBalance(user.uid);
        setBalance(newBal);
        window.history.replaceState({}, "", "/chat");
      }
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (!sessionStart || !userId || anonymous) return;
    const id = setInterval(() => {
      const secs = sessionOffset + Math.floor((Date.now() - sessionStart) / 1000);
      setElapsed(secs);
      // deduz saldo a cada 30 segundos
      if (secs - lastDeductRef.current >= 30) {
        const diff = secs - lastDeductRef.current;
        lastDeductRef.current = secs;
        deductBalance(userId, diff).then(() =>
          getBalance(userId).then(setBalance)
        );
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStart, sessionOffset, userId, anonymous]);

  const handleSelectConversation = async (id: string) => {
    if (!userId) return;
    pauseTimer(conversationId);
    setConversationId(id);
    const msgs = await loadMessages(userId, id);
    setMessages(msgs);
    setAnonymous(false);
    resumeTimer(id);
  };

  const handleNewConversation = async () => {
    pauseTimer(conversationId);
    setMessages([]);
    setConversationId(null);
    setAnonymous(false);
    setSessionStart(null);
    setSessionOffset(0);
    setElapsed(0);
  };

  const handleDeleteConversation = async (id: string) => {
    if (!userId) return;
    await deleteConversation(userId, id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (conversationId === id) { setMessages([]); setConversationId(null); }
  };

  const handleRenameConversation = async (id: string, title: string) => {
    if (!userId) return;
    await updateConversationTitle(userId, id, title);
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, preview: title } : c));
  };

  const handlePinConversation = async (id: string, pinned: boolean) => {
    if (!userId) return;
    await togglePinConversation(userId, id, pinned);
    setConversations((prev) => {
      const updated = prev.map((c) => c.id === id ? { ...c, pinned } : c);
      return [...updated.filter((c) => c.pinned), ...updated.filter((c) => !c.pinned)];
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userId) return;

      const isFirst = messages.length === 0;
      let convId = conversationId;

      if (!anonymous) {
        if (!convId) {
          convId = await createConversation(userId);
          setConversationId(convId);
          setConversations((prev) => [
            { id: convId!, preview: userText.slice(0, 60), createdAt: new Date() },
            ...prev,
          ]);
        }
      }

      // Retoma o timer ao enviar (cancela inatividade pendente)
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      setSessionStart((prev) => prev ?? Date.now());

      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: userText },
      ];
      setMessages(newMessages);
      setIsLoading(true);
      setStreamingText("");

      if (!anonymous && convId) {
        await saveMessage(userId, convId, { role: "user", content: userText }, isFirst);
      }

      try {
        const { windowed, summary } = windowMessages(newMessages, conversationId);
        const fetchAbort = new AbortController();
        const fetchTimer = setTimeout(() => fetchAbort.abort(), 25000);
        const res = await fetch("/api/chat", {
          method: "POST",
          signal: fetchAbort.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: windowed, summary, profile }),
        });
        clearTimeout(fetchTimer);

        if (!res.ok) {
          const msg = res.status === 429
            ? "O serviço está sobrecarregado agora. Aguarde um momento e tente novamente."
            : "Algo deu errado. Por favor, tente novamente.";
          throw new Error(msg);
        }

        const fullText = await res.text();

        await new Promise<void>((resolve) => {
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setStreamingText(fullText.slice(0, i));
            if (i >= fullText.length) {
              clearInterval(interval);
              resolve();
            }
          }, 15);
        });

        const assistantMsg: Message = { role: "assistant", content: fullText };
        setMessages((prev) => [...prev, assistantMsg]);

        if (!anonymous && convId) {
          await saveMessage(userId, convId, assistantMsg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Algo deu errado. Por favor, tente novamente.";
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
      } finally {
        setIsLoading(false);
        setStreamingText("");
        // Pausa por inatividade após 5 minutos sem resposta
        inactivityRef.current = setTimeout(() => {
          setSessionStart((prev) => {
            if (!prev) return prev;
            setSessionOffset((off) => off + Math.floor((Date.now() - prev) / 1000));
            return null;
          });
        }, 5 * 60 * 1000);
      }
    },
    [messages, userId, conversationId, profile, anonymous]
  );

  return (
    <main className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--background)" }}>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentId={conversationId}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        onPin={handlePinConversation}
      />

      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: "var(--background)" }}
      >
        {/* Esquerda — menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            title="Conversas"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <Menu size={18} />
          </button>
          <button
            onClick={handleNewConversation}
            className="text-xl font-serif tracking-wide transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)", fontFamily: "var(--font-cormorant)" }}
          >
            Auscultare
          </button>
        </div>

        {/* Centro — timer + botão Nova */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {sessionStart !== null && (
            <span
              className="text-xs tabular-nums"
              style={{ color: "var(--accent)", fontFamily: "var(--font-inter)" }}
            >
              {String(Math.floor(elapsed / 3600)).padStart(2, "0")}:
              {String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </span>
          )}
          {sessionStart === null && elapsed > 0 && (
            <span
              className="text-xs tabular-nums opacity-40"
              style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
            >
              ⏸ {String(Math.floor(elapsed / 3600)).padStart(2, "0")}:
              {String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </span>
          )}
          {hasMessages && (
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ color: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--font-inter)" }}
            >
              <RotateCcw size={13} /> Nova conversa
            </button>
          )}
        </div>

        {/* Direita — usuário + horas + sair */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}
          >
            Olá, {profile?.name || userEmail?.split("@")[0]}
          </button>
          {!anonymous && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
              style={{ background: "var(--accent-light)", color: "var(--accent)", fontFamily: "var(--font-inter)" }}
            >
              + Horas
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--font-inter)" }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      {/* Avisos de saldo */}
      {!anonymous && balanceUrgent && !balanceExhausted && (
        <div className="flex justify-center py-2 px-4">
          <span className="text-xs px-4 py-2 rounded-full" style={{ background: "#FEE2E2", color: "#B91C1C", fontFamily: "var(--font-inter)" }}>
            Restam menos de 2 minutos de sessão.{" "}
            <button onClick={() => setShowPlanModal(true)} className="underline font-medium">Adicionar horas</button>
          </span>
        </div>
      )}
      {!anonymous && balanceWarning && !balanceUrgent && (
        <div className="flex justify-center py-2 px-4">
          <span className="text-xs px-4 py-2 rounded-full" style={{ background: "#FEF3C7", color: "#92400E", fontFamily: "var(--font-inter)" }}>
            Restam cerca de {Math.ceil((balance ?? 0) / 60)} minutos de sessão.{" "}
            <button onClick={() => setShowPlanModal(true)} className="underline font-medium">Adicionar horas</button>
          </span>
        </div>
      )}

      {/* Landing */}
      {!hasMessages && (
        <section className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6 overflow-hidden">
          <Greeting name={profile?.name} />
          <SaintQuote />

          <div className="w-full max-w-2xl px-4 space-y-3">
            <ChatInput onSend={sendMessage} disabled={isLoading || (!anonymous && balanceExhausted)} />

            {/* Modo anônimo */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setAnonymous((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: anonymous ? "var(--accent-light)" : "transparent",
                  color: anonymous ? "var(--accent)" : "var(--muted)",
                  border: `1px solid ${anonymous ? "var(--accent)" : "var(--border)"}`,
                  fontFamily: "var(--font-inter)",
                }}
              >
                <EyeOff size={12} />
                {anonymous ? "Modo anônimo ativo" : "Conversa anônima"}
              </button>
            </div>

            <p className="text-center text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
              Pressione Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </section>
      )}

      {/* Chat view */}
      {hasMessages && (
        <>
          {anonymous && (
            <div className="flex justify-center py-2 px-4">
              <span
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full text-center"
                style={{ background: "var(--accent-light)", color: "var(--accent)", fontFamily: "var(--font-inter)" }}
              >
                <EyeOff size={11} className="shrink-0" />
                Modo anônimo — esta conversa não está sendo salva e será perdida ao fechar a aba.
              </span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && streamingText && (
                <ChatMessage role="assistant" content={streamingText} streaming />
              )}
              {isLoading && !streamingText && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl text-sm animate-pulse"
                    style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                    •••
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 px-4 py-4 border-t"
            style={{ background: "var(--background)", borderColor: "var(--border)" }}>
            {!anonymous && balanceExhausted ? (
              <div className="text-center space-y-3 py-2">
                <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-inter)" }}>
                  Seu tempo de sessão acabou.
                </p>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium"
                  style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-inter)" }}
                >
                  Adicionar horas
                </button>
              </div>
            ) : (
              <ChatInput onSend={sendMessage} disabled={isLoading || (!anonymous && balanceExhausted)} />
            )}
          </div>
        </>
      )}

      {showPlanModal && userId && (
        <PlanModal userId={userId} onClose={() => setShowPlanModal(false)} />
      )}
    </main>
  );
}
