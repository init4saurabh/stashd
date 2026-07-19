import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { SaveLinkModal } from "@/components/link/save-link-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-md bg-card border border-border shadow-sm"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "z-50",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 transition-transform duration-200 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
              )
            : "relative",
        )}
      >
        <div className="relative h-full">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

   <main className={cn("flex-1 relative overflow-auto", isMobile && "pt-14")}>
        {children}
        <SaveLinkModal />
      </main>
    </div>
  );
}