import type { ChatMessage, Conversation, MessagePart } from "./agent-types";
import { backendFetch } from "./backend-api";

/** First message typed on the empty state, handed to the thread route after navigation. */
const pending = new Map<string, string>();
export const setPendingPrompt = (id: string, text: string) => pending.set(id, text);
export const takePendingPrompt = (id: string) => {
  const value = pending.get(id);
  pending.delete(id);
  return value ?? null;
};

export async function listConversations(): Promise<Conversation[]> {
  return backendFetch<Conversation[]>("/conversations");
}

export async function createConversation(title: string): Promise<Conversation> {
  return backendFetch<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function renameConversation(id: string, title: string) {
  await backendFetch<{ ok: boolean }>(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function setPinned(id: string, pinned: boolean) {
  await backendFetch<{ ok: boolean }>(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ pinned }),
  });
}

export async function deleteConversation(id: string) {
  await backendFetch<{ ok: boolean }>(`/conversations/${id}`, { method: "DELETE" });
}

export async function touchConversation(id: string) {
  await backendFetch<{ ok: boolean }>(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ touch: true }),
  });
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const data = await backendFetch<Array<{ id: string; role: string; parts: unknown; created_at: string }>>(
    `/conversations/${conversationId}/messages`,
  );

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role === "user" ? "user" : "assistant",
    parts: (row.parts as unknown as MessagePart[]) ?? [],
    createdAt: row.created_at,
  }));
}

export async function saveMessage(input: {
  conversationId: string;
  role: "user" | "assistant";
  parts: MessagePart[];
}): Promise<ChatMessage> {
  const data = await backendFetch<{ id: string; parts: unknown; created_at: string }>(
    `/conversations/${input.conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ role: input.role, parts: input.parts }),
    },
  );

  return {
    id: data.id,
    role: input.role,
    parts: (data.parts as unknown as MessagePart[]) ?? [],
    createdAt: data.created_at,
  };
}

