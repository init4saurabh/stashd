import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListCollections, useCreateCollection, getListCollectionsQueryKey } from "@stashd/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Folder, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import gsap from "gsap";

export default function Collections() {
  const { data: collections, isLoading } = useListCollections();
  const createCollection = useCreateCollection();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && collections?.length && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".collection-card");
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, [isLoading, collections]);

  const handleCreate = () => {
    if (!newColName.trim()) return;
    createCollection.mutate(
      { data: { name: newColName } },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewColName("");
          queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">Collections</h1>
            <p className="text-muted-foreground font-mono text-sm">Organize your links into folders.</p>
          </div>

          <Button onClick={() => setIsCreating(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> New Collection
          </Button>
        </header>

        {isCreating && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 flex gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-foreground">Collection Name</label>
              <Input
                autoFocus
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. Design Inspiration"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createCollection.isPending || !newColName.trim()}>
              {createCollection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <div className="collection-card group bg-card border border-border rounded-xl p-6 hover-elevate cursor-pointer transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: col.color ? `${col.color}20` : "var(--secondary)" }}
                    >
                      <Folder className="h-5 w-5" style={{ color: col.color || "var(--secondary)" }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {col.linkCount || 0} links
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-secondary transition-colors">
                    {col.name}
                  </h3>

                  {col.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{col.description}</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground">
                    Created {format(new Date(col.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}