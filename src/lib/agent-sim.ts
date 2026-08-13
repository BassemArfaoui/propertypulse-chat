import { PROPERTIES } from "./properties";
import type { AnalyticsPayload, Property, StreamEvent } from "./agent-types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rid = () => Math.random().toString(36).slice(2, 10);

function budgetFrom(text: string): number | null {
  const m = text.match(/(\d[\d\s.,]*)\s*(k|K|thousand)?/);
  if (!m?.[1]) return null;
  const raw = Number(m[1].replace(/[\s.,]/g, ""));
  if (!raw) return null;
  return m[2] ? raw * 1000 : raw;
}

function matchProperties(text: string): Property[] {
  const t = text.toLowerCase();
  const budget = budgetFrom(t);
  let list = [...PROPERTIES];
  if (budget && budget > 1000) list = list.filter((p) => p.price <= budget * 1.05);
  if (t.includes("villa")) list = list.filter((p) => p.type === "Villa");
  if (t.includes("apartment") || t.includes("apartments"))
    list = list.filter((p) => p.type === "Apartment" || p.type === "Penthouse");
  return (list.length ? list : PROPERTIES).slice(0, 4);
}

const ANALYTICS: AnalyticsPayload = {
  title: "Greater Tunis — price trend & absorption",
  kpis: [
    { label: "Median price / m²", value: "2 340 TND", delta: "+6.1% YoY" },
    { label: "Avg. days on market", value: "48 days", delta: "-9 days" },
    { label: "Active listings", value: "1 284", delta: "+3.4%" },
    { label: "Deal conversion", value: "12.7%", delta: "+1.2 pts" },
  ],
  series: [
    { label: "Jan", value: 2110 },
    { label: "Feb", value: 2145 },
    { label: "Mar", value: 2190 },
    { label: "Apr", value: 2205 },
    { label: "May", value: 2260 },
    { label: "Jun", value: 2288 },
    { label: "Jul", value: 2310 },
    { label: "Aug", value: 2340 },
  ],
};

type Plan = {
  thoughts: string[];
  tool: { name: string; args: Record<string, unknown> } | null;
  result: { summary: string; data: unknown } | null;
  ui: { component: "property_grid" | "analytics"; data: unknown } | null;
  answer: string;
};

function planFor(text: string): Plan {
  const t = text.toLowerCase();

  if (t.includes("market") || t.includes("trend") || t.includes("analytics") || t.includes("price per")) {
    return {
      thoughts: [
        "Interpreting the request as a market analysis question.",
        "Pulling 8 months of transaction data for Greater Tunis.",
      ],
      tool: { name: "market_analytics", args: { region: "Greater Tunis", window: "8m", metric: "price_per_sqm" } },
      result: { summary: "8 monthly datapoints, 4 KPIs computed", data: ANALYTICS },
      ui: { component: "analytics", data: ANALYTICS },
      answer:
        "Prices in Greater Tunis are up **6.1% year over year**, now averaging **2 340 TND/m²**. Momentum is strongest in La Marsa and Gammarth, while time on market keeps compressing — 48 days on average, nine days faster than last year.\n\nIf you have sellers waiting, this is a favourable window to list.",
    };
  }

  if (t.includes("add") && (t.includes("property") || t.includes("listing"))) {
    return {
      thoughts: ["The user wants to create a listing.", "Checking which fields are still missing before writing to the CRM."],
      tool: {
        name: "create_property_draft",
        args: { type: "unspecified", location: "unspecified", price: null, status: "draft" },
      },
      result: { summary: "Draft created — 3 required fields missing", data: { draft_id: "DR-" + rid().toUpperCase(), missing: ["type", "location", "price"] } },
      ui: null,
      answer:
        "I've opened a **draft listing** in the CRM. To publish it I still need three things:\n\n1. Property type (apartment, villa, duplex…)\n2. Location or neighbourhood\n3. Asking price\n\nSend them in one line and I'll complete the record.",
    };
  }

  if (t.includes("match") || t.includes("client") || t.includes("buyer")) {
    const props = matchProperties(t);
    return {
      thoughts: [
        "Loading the client's saved criteria and past viewings.",
        "Scoring the live inventory against budget, rooms and area.",
      ],
      tool: { name: "match_client", args: { client: "auto-detected", weight: { budget: 0.4, area: 0.35, rooms: 0.25 } } },
      result: { summary: `${props.length} listings scored above 0.7`, data: props },
      ui: { component: "property_grid", data: props },
      answer:
        "Here are the strongest matches against that client profile. The top two clear the budget with room to negotiate — I'd lead with the sea-view penthouse and keep the duplex as the fallback.",
    };
  }

  const props = matchProperties(t);
  return {
    thoughts: [
      "Parsing the query into structured search filters.",
      "Querying the live inventory index.",
    ],
    tool: {
      name: "search_properties",
      args: {
        query: text.slice(0, 80),
        city: "Tunis",
        max_price: budgetFrom(t) ?? null,
        limit: 4,
      },
    },
    result: { summary: `${props.length} matching listings`, data: props },
    ui: { component: "property_grid", data: props },
    answer:
      "I found **" +
      props.length +
      " listings** that fit. Prices, surface and room counts are below — click any card for the full record.\n\nWant me to shortlist them for a client or schedule viewings?",
  };
}

/** Simulated agentic stream: reasoning → tool call → tool result → custom UI → tokens. */
export async function* runAgent(
  text: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const plan = planFor(text);
  const stop = () => signal?.aborted === true;

  for (const thought of plan.thoughts) {
    if (stop()) return;
    await sleep(520);
    yield { type: "thought", content: thought };
  }

  if (plan.tool) {
    await sleep(420);
    if (stop()) return;
    const id = rid();
    yield { type: "tool_call", id, tool: plan.tool.name, args: plan.tool.args };
    await sleep(900);
    if (stop()) return;
    if (plan.result) {
      yield { type: "tool_result", id, tool: plan.tool.name, summary: plan.result.summary, data: plan.result.data };
    }
  }

  yield { type: "thought_done" };

  if (plan.ui) {
    await sleep(280);
    if (stop()) return;
    yield { type: "custom_ui", component: plan.ui.component, data: plan.ui.data };
  }

  const tokens = plan.answer.match(/\S+\s*/g) ?? [];
  for (const token of tokens) {
    if (stop()) return;
    await sleep(18 + Math.random() * 34);
    yield { type: "text_delta", delta: token };
  }

  yield { type: "done" };
}

export function titleFor(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 48 ? clean.slice(0, 48).trimEnd() + "…" : clean || "New chat";
}
