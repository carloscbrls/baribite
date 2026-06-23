import { Link, useLocation } from "wouter";
import { Home, MapPin, ShoppingBasket, HeartHandshake, AlertTriangle } from "lucide-react";
import { Wordmark } from "./Logo";

const NAV = [
  { href: "/", label: "Today", icon: Home, testid: "nav-today" },
  { href: "/where", label: "Eat out", icon: MapPin, testid: "nav-where" },
  { href: "/sprouts", label: "Sprouts", icon: ShoppingBasket, testid: "nav-sprouts" },
  { href: "/wife", label: "Partner", icon: HeartHandshake, testid: "nav-wife" },
];

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [location] = useLocation();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:max-w-lg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home-logo">
            <Wordmark />
          </Link>
          <Link
            href="/emergency"
            data-testid="link-emergency-header"
            className="flex items-center gap-1.5 rounded-full border border-coral-border bg-coral-soft px-3 py-1.5 text-xs font-bold text-coral hover-elevate active-elevate-2"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Red flag?
          </Link>
        </div>
        {title ? (
          <h1 className="mt-3 text-xl font-bold tracking-tight text-foreground" data-testid="text-page-title">
            {title}
          </h1>
        ) : null}
      </header>

      {/* Page content */}
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      {/* Persistent emergency strip above the nav */}
      <Link
        href="/emergency"
        data-testid="link-emergency-strip"
        className="fixed inset-x-0 bottom-[4.25rem] z-20 mx-auto flex max-w-md items-center justify-center gap-2 border-t border-coral-border bg-coral-soft py-2 text-sm font-semibold text-coral sm:max-w-lg"
      >
        <AlertTriangle className="h-4 w-4" />
        Red flag? Tap here for the emergency screen
      </Link>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md border-t border-border bg-card sm:max-w-lg">
        {NAV.map(({ href, label, icon: Icon, testid }) => {
          const active = location === href;
          return (
            <Link
              key={href}
              href={href}
              data-testid={testid}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
