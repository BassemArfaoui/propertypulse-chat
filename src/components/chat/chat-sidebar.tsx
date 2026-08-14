import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pin, PinOff, Plus, Search, Trash2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/estate-agent-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteConversation, listConversations, setPinned } from "@/lib/chat-store";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

function relative(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
  });

  const filtered = useMemo(
    () => conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [conversations, query],
  );

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => setPinned(id, pinned),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    onError: () => toast.error("Couldn't update that chat"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (params.threadId === id) navigate({ to: "/" });
    },
    onError: () => toast.error("Couldn't delete that chat"),
  });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <img src={logo} alt="" width={512} height={512} className="size-7" />
        <span className="font-display text-base tracking-tight">Terra</span>
        <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Agent
        </span>
      </div>

      <div className="space-y-3 px-3">
        <Button
          className="w-full justify-start gap-2 rounded-xl"
          onClick={() => {
            onNavigate?.();
            navigate({ to: "/" });
          }}
        >
          <Plus className="size-4" /> New chat
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="rounded-xl border-sidebar-border bg-sidebar-accent/50 pl-9"
          />
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">No conversations yet</p>
        ) : null}
        {filtered.map((conversation) => {
          const active = params.threadId === conversation.id;
          return (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-1 rounded-xl px-2 transition-colors",
                active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
              )}
            >
              <Link
                to="/c/$threadId"
                params={{ threadId: conversation.id }}
                onClick={onNavigate}
                className="min-w-0 flex-1 py-2"
              >
                <p className="flex items-center gap-1.5 truncate text-sm">
                  {conversation.pinned ? <Pin className="size-3 shrink-0 text-primary" /> : null}
                  <span className="truncate">{conversation.title}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{relative(conversation.updated_at)}</p>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Chat actions"
                    className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      pinMutation.mutate({ id: conversation.id, pinned: !conversation.pinned })
                    }
                  >
                    {conversation.pinned ? (
                      <>
                        <PinOff className="mr-2 size-4" /> Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 size-4" /> Pin
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteMutation.mutate(conversation.id)}
                  >
                    <Trash2 className="mr-2 size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">Local workspace</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
