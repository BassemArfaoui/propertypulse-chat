import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { MessageRenderer } from "./message-renderer";
import { useAgentStream } from "./use-agent-stream";
import { useAuth } from "@/hooks/use-auth";
import type { ChatMessage, MessagePart } from "@/lib/agent-types";
import { listMessages, saveMessage, takePendingPrompt, touchConversation } from "@/lib/chat-store";

/** Only the newest slice is mounted; older turns stay off-DOM until requested. */
const WINDOW = 40;

export function ChatThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [local, setLocal] = useState<ChatMessage[]>([]);
  const [window_, setWindow] = useState(WINDOW);
  const startedFor = useRef<string | null>(null);

  const { data: persisted = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => listMessages(conversationId),
  });

  useEffect(() => {
    setLocal([]);
    setWindow(WINDOW);
  }, [conversationId]);

  const persist = useCallback(
    async (role: "user" | "assistant", parts: MessagePart[]) => {
      if (!user) return;
      try {
        await saveMessage({ conversationId, userId: user.id, role, parts });
        await touchConversation(conversationId);
        await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        setLocal((prev) => prev.filter((m) => m.role !== role || !m.pending));
      } catch {
        toast.error("Message couldn't be saved to your history");
      }
    },
    [conversationId, queryClient, user],
  );

  const onComplete = useCallback(
    (parts: MessagePart[]) => {
      void persist("assistant", parts);
    },
    [persist],
  );

  const { draft, status, start, stop } = useAgentStream(onComplete);

  const send = useCallback(
    (text: string) => {
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text }],
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setLocal((prev) => [...prev, optimistic]);
      void persist("user", optimistic.parts);
      void start(text);
    },
    [persist, start],
  );

  // Run the first message typed on the empty state, once per conversation.
  useEffect(() => {
    if (startedFor.current === conversationId) return;
    const prompt = takePendingPrompt(conversationId);
    if (!prompt) return;
    startedFor.current = conversationId;
    void start(prompt);
  }, [conversationId, start]);

  const all = [...persisted, ...local];
  const hidden = Math.max(0, all.length - window_);
  const visible = all.slice(hidden);

  return (
    <>
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6">
          {hidden > 0 ? (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setWindow((w) => w + WINDOW)}>
                Show {Math.min(hidden, WINDOW)} earlier messages
              </Button>
            </div>
          ) : null}

          {visible.map((message) => (
            <MessageRenderer key={message.id} message={message} streaming={false} />
          ))}

          {draft && draft.parts.length > 0 ? (
            <MessageRenderer message={draft} streaming />
          ) : null}

          {status === "submitted" && (!draft || draft.parts.length === 0) ? (
            <Message from="assistant">
              <MessageContent>
                <span className="flex items-center gap-2">
                  <Sparkle className="size-4 text-primary" />
                  <Shimmer className="text-sm">Thinking…</Shimmer>
                </span>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <Composer onSend={send} onStop={stop} status={status} />
        </div>
      </div>
    </>
  );
}
