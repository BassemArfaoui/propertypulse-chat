import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/estate-agent-logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Terra Real Estate Agent" },
      { name: "description", content: "Sign in to your Terra workspace to chat with the real estate agent." },
      { property: "og:title", content: "Sign in — Terra Real Estate Agent" },
      { property: "og:description", content: "Access your saved conversations and listings." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
      <div className="animate-rise-in relative w-full max-w-sm rounded-3xl border border-border bg-surface p-8 shadow-lifted">
        <img src={logo} alt="Terra logo" width={512} height={512} className="mx-auto size-12" />
        <h1 className="mt-4 text-center font-display text-2xl tracking-tight">Auth disabled</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          This build now uses local backend APIs and SQLite.
        </p>

        <Button asChild className="mt-6 w-full">
          <Link to="/">Go to chat</Link>
        </Button>
      </div>
    </div>
  );
}
