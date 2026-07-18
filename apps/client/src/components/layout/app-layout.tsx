import { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { SaveLinkModal } from "@/components/link/save-link-modal";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <main className="flex-1 relative overflow-auto">
        {children}
        <SaveLinkModal />
      </main>
    </div>
  );
}