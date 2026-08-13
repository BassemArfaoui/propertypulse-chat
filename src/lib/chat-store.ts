import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, Conversation, MessagePart } from "./agent-types";

/** First message typed on the empty state, handed to the thread route after navigation. */
const pending = new Map<string, string>();
export const setPendingPrompt = (id: string, text: string) => pending.set(id, text);
export const takePendingPrompt = (id: string) => {
  const value = pending.get(id);
  pending.delete(id);
  return value ?? null;
};

export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,pinned,updated_at")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(userId: string, title: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select("id,title,pinned,updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function renameConversation(id: string, title: string) {
  const { error } = await supabase.from("conversations").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function setPinned(id: string, pinned: boolean) {
  const { error } = await supabase.from("conversations").update({ pinned }).eq("id", id);
  if (error) throw error;
}

export async function deleteConversation(id: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) throw error;
}

export async function touchConversation(id: string) {
  const { error } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,role,parts,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role === "user" ? "user" : "assistant",
    parts: (row.parts as unknown as MessagePart[]) ?? [],
    createdAt: row.created_at,
  }));
}

export async function saveMessage(input: {
  conversationId: string;
  userId: string;
  role: "user" | "assistant";
  parts: MessagePart[];
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      user_id: input.userId,
      role: input.role,
      parts: input.parts as unknown as never,
    })
    .select("id,role,parts,created_at")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    role: input.role,
    parts: (data.parts as unknown as MessagePart[]) ?? [],
    createdAt: data.created_at,
  };
}
