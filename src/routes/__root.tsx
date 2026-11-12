import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="dotted-bg flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-[22px] border-3 border-foreground bg-card p-8 text-center shadow-hard">
        <p className="display text-8xl text-primary">404</p>
        <h1 className="mt-4 text-xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>This page does not exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may be old or mistyped. Check the address, or go back to the home page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="inline-flex h-11 items-center rounded-[14px] border-2 border-foreground bg-primary px-5 text-sm font-bold text-primary-foreground shadow-hard-sm">Go to home</Link>
          <Link to="/app" className="inline-flex h-11 items-center rounded-[14px] border-2 border-foreground bg-card px-5 text-sm font-bold shadow-hard-sm">Open workspace</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-[22px] border-3 border-foreground bg-card p-8 text-center shadow-hard">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>
          This page did not load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our side. Try again, and if it keeps happening, go back to the home page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center h-11 rounded-[14px] border-2 border-foreground bg-primary px-5 text-sm font-bold text-primary-foreground shadow-hard-sm"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center h-11 rounded-[14px] border-2 border-foreground bg-card px-5 text-sm font-bold shadow-hard-sm"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SYNEXIS | Project management for small teams" },
      {
        name: "description",
        content:
          "SYNEXIS helps small teams plan projects, assign tasks and meet deadlines in one shared workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-right" toastOptions={{ className: "ink-2 rounded-[14px] font-semibold" }} />
    </QueryClientProvider>
  );
}

