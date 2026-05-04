interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function ChatMessage({ role, content, streaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`${isUser ? "animate-fade-up" : ""} flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className="max-w-[80%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser ? "var(--accent)" : "var(--card)",
          color: isUser ? "#fff" : "var(--foreground)",
          border: isUser ? "none" : "1px solid var(--border)",
          fontFamily: "var(--font-inter)",
          borderBottomRightRadius: isUser ? "6px" : "18px",
          borderBottomLeftRadius: isUser ? "18px" : "6px",
        }}
      >
        {content}
        {streaming && (
          <span
            className="inline-block w-1.5 h-4 ml-0.5 rounded-sm align-middle animate-pulse"
            style={{ background: "var(--muted)" }}
          />
        )}
      </div>
    </div>
  );
}
