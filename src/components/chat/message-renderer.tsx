import { useState } from "react";
import { Brain, ChevronRight } from "lucide-react";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AnalyticsPanel } from "./analytics-panel";
import { PropertyGrid } from "./property-grid";
import { ToolEventCard } from "./tool-event-card";
import type { AnalyticsPayload, ChatMessage, MessagePart, Property } from "@/lib/agent-types";
import { cn } from "@/lib/utils";

function ReasoningPanel({ parts, streaming }: { parts: Extract<MessagePart, { type: "thought" }>[]; streaming: boolean }) {
  const [open, setOpen] = useState(false);
  const last = parts[parts.length - 1];
  if (!last) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface-2/60 px-3.5 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Brain className="size-4 shrink-0 text-primary" />
        {streaming ? (
          <Shimmer className="text-sm">{last.text}</Shimmer>
        ) : (
          <span>Reasoned through {parts.length} step{parts.length > 1 ? "s" : ""}</span>
        )}
        <ChevronRight
          className={cn("ml-auto size-4 shrink-0 transition-transform", open && "rotate-90")}
        />
      </button>
      {open ? (
        <ol className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
          {parts.map((part, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">{i + 1}.</span>
              <span>{part.text}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function MessageRenderer({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const thoughts = message.parts.filter((p) => p.type === "thought");
  const rest = message.parts.filter((p) => p.type !== "thought");
  const results = new Map(
    message.parts.flatMap((p) => (p.type === "tool_result" ? [[p.id, p] as const] : [])),
  );

  return (
    <Message from={message.role} className="animate-rise-in">
      <MessageContent className="gap-3">
        {message.role === "assistant" && thoughts.length > 0 ? (
          <ReasoningPanel parts={thoughts} streaming={streaming && !thoughts[thoughts.length - 1]?.done} />
        ) : null}

        {rest.map((part, index) => {
          if (part.type === "text") {
            return (
              <MessageResponse key={index}>
                {part.text || (streaming ? "" : " ")}
              </MessageResponse>
            );
          }
          if (part.type === "tool_call") {
            const result = results.get(part.id);
            return (
              <ToolEventCard
                key={part.id}
                tool={part.tool}
                args={part.args}
                state={part.state}
                {...(result?.summary ? { summary: result.summary } : {})}
                {...(result ? { output: result.data } : {})}
              />
            );
          }
          if (part.type === "custom_ui") {
            if (part.component === "property_grid") {
              return <PropertyGrid key={index} properties={part.data as Property[]} />;
            }
            return <AnalyticsPanel key={index} data={part.data as AnalyticsPayload} />;
          }
          return null;
        })}
      </MessageContent>
    </Message>
  );
}
