const MESSAGES_KEY = "auscultare_messages";
const MEMORY_KEY = "auscultare_memory_enabled";

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

export function isMemoryEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MEMORY_KEY) === "true";
}

export function setMemoryEnabled(value: boolean) {
  localStorage.setItem(MEMORY_KEY, String(value));
  if (!value) clearMessages();
}

export function loadMessages(): StoredMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: StoredMessage[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function clearMessages() {
  localStorage.removeItem(MESSAGES_KEY);
}
