import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListLinks } from "@stashd/api-client";
import { LinkCard } from "@/components/link/link-card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: links, isLoading } = useListLinks({ q: search || undefined });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && links?.length && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".link-card");

      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top bottom-=100",
          },
        },
      );
    }
  }, [isLoading, links]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">Vault</h1>
            <p className="text-muted-foreground font-mono text-sm">Your personal digital archive.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links, tags, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border focus-visible:ring-secondary"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : links?.length ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-card rounded-2xl border border-dashed border-border">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-1">Nothing found</h3>
            <p className="text-muted-foreground text-sm">
              {search ? "No links match your search." : "Your vault is empty. Paste a link to get started."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}