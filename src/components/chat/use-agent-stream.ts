import { useCallback, useRef, useState } from "react";
import type { ChatMessage, MessagePart } from "@/lib/agent-types";
import { backendUrl } from "@/lib/backend-api";

export type StreamStatus = "ready" | "submitted" | "streaming";

/** Drives the simulated agent stream and exposes the partially-built assistant message. */
export function useAgentStream(onComplete: (parts: MessagePart[]) => void) {
  const [draft, setDraft] = useState<ChatMessage | null>(null);
  const [status, setStatus] = useState<StreamStatus>("ready");
  const controller = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controller.current?.abort();
  }, []);

  const start = useCallback(
    async (conversationId: string, prompt: string) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;

      const parts: MessagePart[] = [];
      const id = `draft-${Date.now()}`;
      const push = () =>
        setDraft({ id, role: "assistant", parts: [...parts], createdAt: new Date().toISOString() });

      setStatus("submitted");
      setDraft({ id, role: "assistant", parts: [], createdAt: new Date().toISOString() });

      try {
        const res = await fetch(backendUrl("/chat/stream"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: conversationId, message: prompt }),
          signal: abort.signal,
        });

        if (!res.ok) {
          throw new Error(`Streaming request failed (${res.status})`);
        }

        if (!res.body) {
          throw new Error("No response body returned by backend stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let event: any;
            try {
              event = JSON.parse(trimmed);
            } catch {
              continue;
            }

          if (abort.signal.aborted) break;
          setStatus("streaming");
          switch (event.type) {
            case "thought":
              parts.push({ type: "thought", text: event.content });
              break;
            case "thought_done":
              for (const part of parts) if (part.type === "thought") part.done = true;
              break;
            case "tool_call":
              parts.push({
                type: "tool_call",
                id: event.id,
                tool: event.tool,
                args: event.args,
                state: "running",
              });
              break;
            case "tool_result": {
              const call = parts.find((p) => p.type === "tool_call" && p.id === event.id);
              if (call && call.type === "tool_call") call.state = "done";
              parts.push({
                type: "tool_result",
                id: event.id,
                tool: event.tool,
                summary: event.summary,
                data: event.data,
              });
              break;
            }
            case "custom_ui":
              parts.push({ type: "custom_ui", component: event.component, data: event.data });
              break;
            case "text_delta": {
              const last = parts[parts.length - 1];
              if (last && last.type === "text") last.text += event.delta;
              else parts.push({ type: "text", text: event.delta });
              break;
            }
            case "done":
              break;
            case "final": {
              const last = parts[parts.length - 1];
              const finalText = typeof event.content === "string" ? event.content : "";
              if (finalText && (!last || last.type !== "text")) {
                parts.push({ type: "text", text: finalText });
              }
              break;
            }
          }
          push();
        }
        }
      } finally {
        setStatus("ready");
        setDraft(null);
        if (parts.length > 0) onComplete(parts);
        controller.current = null;
      }
    },
    [onComplete],
  );

  return { draft, status, start, stop };
}
