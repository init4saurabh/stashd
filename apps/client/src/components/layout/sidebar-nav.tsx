import { Link, useLocation } from "wouter";
import { useListCollections, useGetLinkStats, useListTags } from "@stashd/api-client";
import { LayoutDashboard, Folder, Settings, Loader2, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useSession, signOut } from "@/lib/auth-client";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const [location, navigate] = useLocation();
  const { data: stats } = useGetLinkStats();
  const { data: collections, isLoading: colsLoading } = useListCollections();
  const { data: tags, isLoading: tagsLoading } = useListTags();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { href: "/", label: "Vault", icon: LayoutDashboard, count: stats?.total },
    { href: "/collections", label: "Collections", icon: Folder, count: stats?.collectionsCount },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="p-6">
        <Link href="/" onClick={onNavigate}>
          <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-primary cursor-pointer">
            <div className="h-6 w-6 rounded bg-secondary rounded-tr-none flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
            Stashd
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto px-4 py-2 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  location === item.href
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {item.count !== undefined && (
                  <span className="text-xs font-mono opacity-60">{item.count}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collections</h3>
          </div>
          <div className="space-y-1">
            {colsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              collections?.map((col) => (
                <Link key={col.id} href={`/collections/${col.id}`} onClick={onNavigate}>
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
                      location === `/collections/${col.id}`
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: col.color || "var(--secondary)" }}
                      />
                      <span className="truncate">{col.name}</span>
                    </div>
                    {col.linkCount !== undefined && (
                      <span className="text-xs font-mono opacity-60">{col.linkCount}</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-1 px-3">
            {tagsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              tags?.map((tag) => (
                <div
                  key={tag.name}
                  className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-border cursor-pointer transition-colors"
                >
                  #{tag.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {session?.user && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-semibold shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-mono">Appearance</span>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                resolvedTheme === "light"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Light mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                resolvedTheme === "dark"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}