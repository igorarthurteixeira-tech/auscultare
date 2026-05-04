const SUMMARY_PREFIX = "auscultare_summary_";

export function loadSummary(conversationId: string): string {
  try {
    return localStorage.getItem(SUMMARY_PREFIX + conversationId) ?? "";
  } catch {
    return "";
  }
}

export function saveSummary(conversationId: string, summary: string) {
  try {
    localStorage.setItem(SUMMARY_PREFIX + conversationId, summary);
  } catch {}
}

export function clearSummary(conversationId: string) {
  try {
    localStorage.removeItem(SUMMARY_PREFIX + conversationId);
  } catch {}
}

// Gera um resumo simples das mensagens antigas sem chamada extra à API
export function buildSummary(messages: { role: string; content: string }[]): string {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.slice(0, 120))
    .join(" | ");
  return userMessages ? `Contexto anterior da conversa (resumido): ${userMessages}` : "";
}

// Janela deslizante: retorna só as últimas N mensagens + injeta resumo das antigas
export function windowMessages(
  messages: { role: string; content: string }[],
  conversationId: string | null,
  windowSize = 8
): { windowed: { role: string; content: string }[]; summary: string } {
  if (messages.length <= windowSize) {
    return { windowed: messages, summary: "" };
  }

  const older = messages.slice(0, -windowSize);
  const recent = messages.slice(-windowSize);

  let summary = conversationId ? loadSummary(conversationId) : "";
  if (!summary) {
    summary = buildSummary(older);
    if (conversationId && summary) saveSummary(conversationId, summary);
  }

  return { windowed: recent, summary };
}
