import { Building2, LineChart, PlusSquare, Users, Wrench } from "lucide-react";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  search_properties: Building2,
  market_analytics: LineChart,
  create_property_draft: PlusSquare,
  match_client: Users,
};

const toolLabels: Record<string, string> = {
  search_properties: "Searching listings",
  market_analytics: "Analysing the market",
  create_property_draft: "Creating a listing draft",
  match_client: "Matching client profile",
};

export function ToolEventCard({
  tool,
  args,
  state,
  summary,
  output,
}: {
  tool: string;
  args: Record<string, unknown>;
  state: "running" | "done" | "error";
  summary?: string;
  output?: unknown;
}) {
  const Icon = toolIcons[tool] ?? Wrench;
  const label = toolLabels[tool] ?? tool;
  const uiState =
    state === "running" ? "input-available" : state === "error" ? "output-error" : "output-available";

  return (
    <Tool defaultOpen={false} className="mb-0 rounded-2xl border-border bg-surface-2/70">
      <ToolHeader
        type="dynamic-tool"
        toolName={tool}
        state={uiState}
        title={label}
        className="px-3.5 py-2.5"
      />
      <ToolContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="size-3.5" />
          <code className="font-mono">{tool}</code>
          {summary ? <span>· {summary}</span> : null}
        </div>
        <ToolInput input={args} />
        {output !== undefined ? <ToolOutput output={output} errorText={undefined} /> : null}
      </ToolContent>
    </Tool>
  );
}
