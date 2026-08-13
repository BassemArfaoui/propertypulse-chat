import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChatShell } from "@/components/chat/chat-shell";
import { ChatThread } from "@/components/chat/chat-thread";
import { listConversations } from "@/lib/chat-store";

export const Route = createFileRoute("/c/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation — Terra Real Estate Agent" },
      {
        name: "description",
        content: "A streaming conversation with your real estate agent: listings, clients, analytics.",
      },
      { property: "og:title", content: "Conversation — Terra Real Estate Agent" },
      {
        property: "og:description",
        content: "Streaming answers with property cards and market analytics.",
      },
    ],
  }),
  component: ThreadRoute,
});

function ThreadRoute() {
  const { threadId } = Route.useParams();
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
  });
  const title = conversations.find((c) => c.id === threadId)?.title ?? "New conversation";

  return (
    <ChatShell header={<h1 className="truncate text-sm font-medium">{title}</h1>}>
      <ChatThread key={threadId} conversationId={threadId} />
    </ChatShell>
  );
}
