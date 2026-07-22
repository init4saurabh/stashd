import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListLinks, useDeleteLink, getListLinksQueryKey, getGetLinkStatsQueryKey } from "@stashd/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { LinkCard } from "@/components/link/link-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CheckSquare, X, Trash2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useToast } from "@/hooks/use-toast";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: links, isLoading } = useListLinks({ q: search || undefined });
  const gridRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteLink = useDeleteLink();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
          scrollTrigger: { trigger: gridRef.current, start: "top bottom-=100" },
        },
      );
    }
  }, [isLoading, links]);

  const invalidateAfterDelete = () => {
    queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLinkStatsQueryKey() });
  };

  const handleSingleDelete = (id: number) => {
    if (!confirm("Delete this link?")) return;
    deleteLink.mutate(
      { id },
      {
        onSuccess: () => {
          invalidateAfterDelete();
          toast({ title: "Link deleted" });
        },
      },
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected link(s)?`)) return;

    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => deleteLink.mutateAsync({ id })));
    setBulkDeleting(false);
    setSelectedIds(new Set());
    setSelectMode(false);
    invalidateAfterDelete();
    toast({ title: `${ids.length} link(s) deleted` });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8 md:p-12 pb-28">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">Vault</h1>
            <p className="text-muted-foreground font-mono text-sm">Your personal digital archive.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links, tags, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border focus-visible:ring-secondary"
              />
            </div>

            {selectMode ? (
              <Button variant="outline" size="icon" onClick={exitSelectMode} title="Cancel selection">
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={() => setSelectMode(true)} title="Select links">
                <CheckSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : links?.length ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                selectMode={selectMode}
                selected={selectedIds.has(link.id)}
                onToggleSelect={toggleSelect}
                onDeleteClick={handleSingleDelete}
              />
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

      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-full shadow-lg px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
            Delete
          </Button>
        </div>
      )}
    </AppLayout>
  );
}