import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChatShell } from "@/components/chat/chat-shell";
import { EmptyState } from "@/components/chat/empty-state";
import { createConversation, setPendingPrompt } from "@/lib/chat-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terra — Agentic Real Estate Assistant" },
      {
        name: "description",
        content:
          "Search listings, draft properties, match buyers and read market analytics in one streaming AI conversation.",
      },
      { property: "og:title", content: "Terra — Agentic Real Estate Assistant" },
      {
        property: "og:description",
        content: "An AI copilot for real estate agents: listings, clients and market insight.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSend = async (text: string) => {
    try {
      const title = text.length > 48 ? `${text.slice(0, 48)}…` : text;
      const conversation = await createConversation(title);
      setPendingPrompt(conversation.id, text);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate({ to: "/c/$threadId", params: { threadId: conversation.id } });
    } catch {
      toast.error("Couldn't start that conversation");
    }
  };

  return (
    <ChatShell>
      <EmptyState onSend={(text) => void handleSend(text)} />
    </ChatShell>
  );
}
