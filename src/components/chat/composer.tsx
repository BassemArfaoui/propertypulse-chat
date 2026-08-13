import { useEffect, useRef, useState } from "react";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

export function Composer({
  onSend,
  onStop,
  status,
  autoFocus = true,
  className,
  placeholder = "Ask about properties, clients, or deals…",
}: {
  onSend: (text: string) => void;
  onStop?: () => void;
  status: "ready" | "submitted" | "streaming";
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus && status === "ready") ref.current?.focus();
  }, [autoFocus, status]);

  const submit = () => {
    const text = value.trim();
    if (!text || status !== "ready") return;
    setValue("");
    onSend(text);
  };

  return (
    <PromptInput
      className={cn(
        "rounded-3xl border-border bg-surface shadow-soft transition-shadow focus-within:shadow-lifted",
        className,
      )}
      onSubmit={(_message, event) => {
        event.preventDefault();
        submit();
      }}
    >
      <PromptInputTextarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        className="min-h-[60px] text-base"
      />
      <PromptInputFooter className="justify-between border-none px-3 pb-2">
        <span className="text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </span>
        <PromptInputSubmit
          status={status}
          disabled={status === "ready" && value.trim().length === 0}
          {...(onStop ? { onStop } : {})}
          className="rounded-full"
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
