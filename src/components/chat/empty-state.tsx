import logo from "@/assets/estate-agent-logo.png";
import { Composer } from "./composer";

const SUGGESTIONS = [
  "Find apartments in Tunis under 300k",
  "Add a new property",
  "Match a client to houses",
  "Show me the market trend for Greater Tunis",
];

export function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-mesh opacity-70" />
      <div className="animate-soft-fade relative w-full max-w-2xl space-y-8">
        <div className="space-y-3 text-center">
          <img
            src={logo}
            alt="Terra agent logo"
            width={512}
            height={512}
            className="mx-auto size-14"
          />
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            What are we closing today?
          </h1>
          <p className="text-sm text-muted-foreground">
            Search inventory, draft listings, match buyers and read the market — in one conversation.
          </p>
        </div>

        <Composer onSend={onSend} status="ready" />

        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSend(suggestion)}
              className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-muted-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
