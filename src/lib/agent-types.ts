export type Property = {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  rooms: number;
  baths: number;
  size: number;
  type: string;
  image: string;
  status: "available" | "reserved" | "new";
  lat: number;
  lng: number;
};

export type AnalyticsPayload = {
  title: string;
  kpis: { label: string; value: string; delta?: string }[];
  series: { label: string; value: number }[];
};

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "thought"; text: string; done?: boolean }
  | {
      type: "tool_call";
      id: string;
      tool: string;
      args: Record<string, unknown>;
      state: "running" | "done" | "error";
    }
  | { type: "tool_result"; id: string; tool: string; summary: string; data: unknown }
  | { type: "custom_ui"; component: "property_grid" | "analytics"; data: unknown };

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  parts: MessagePart[];
  createdAt: string;
  pending?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  pinned: boolean;
  updated_at: string;
};

export type StreamEvent =
  | { type: "thought"; content: string }
  | { type: "thought_done" }
  | { type: "tool_call"; id: string; tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; id: string; tool: string; summary: string; data: unknown }
  | { type: "custom_ui"; component: "property_grid" | "analytics"; data: unknown }
  | { type: "text_delta"; delta: string }
  | { type: "done" };
