import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  preview: string;
  createdAt: Date;
  pinned?: boolean;
}

export async function createConversation(userId: string): Promise<string> {
  const ref = await addDoc(collection(db, "users", userId, "conversations"), {
    preview: "Nova conversa",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveMessage(
  userId: string,
  conversationId: string,
  message: Message,
  isFirst = false
) {
  await addDoc(
    collection(db, "users", userId, "conversations", conversationId, "messages"),
    { ...message, createdAt: serverTimestamp() }
  );
  if (isFirst && message.role === "user") {
    const preview = message.content.slice(0, 60) + (message.content.length > 60 ? "…" : "");
    await updateDoc(doc(db, "users", userId, "conversations", conversationId), { preview });
  }
}

export async function loadMessages(
  userId: string,
  conversationId: string
): Promise<Message[]> {
  const q = query(
    collection(db, "users", userId, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Message);
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, "users", userId, "conversations"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as Timestamp | null;
    return {
      id: d.id,
      preview: data.preview || "Conversa",
      createdAt: ts ? ts.toDate() : new Date(),
      pinned: data.pinned ?? false,
    };
  });
}

export async function updateConversationTitle(userId: string, conversationId: string, title: string): Promise<void> {
  await updateDoc(doc(db, "users", userId, "conversations", conversationId), { preview: title });
}

export async function togglePinConversation(userId: string, conversationId: string, pinned: boolean): Promise<void> {
  await updateDoc(doc(db, "users", userId, "conversations", conversationId), { pinned });
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  const messagesRef = collection(db, "users", userId, "conversations", conversationId, "messages");
  const snap = await getDocs(messagesRef);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", userId, "conversations", conversationId));
  await batch.commit();
}

export async function getLastConversationId(userId: string): Promise<string | null> {
  const q = query(
    collection(db, "users", userId, "conversations"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}
