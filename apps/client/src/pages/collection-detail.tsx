import { useRef, useEffect } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListLinks,
  useGetCollection,
  getGetCollectionQueryKey,
  getListLinksQueryKey,
} from "@stashd/api-client";
import { LinkCard } from "@/components/link/link-card";
import { Loader2 } from "lucide-react";
import gsap from "gsap";

export default function CollectionDetail() {
  const [, params] = useRoute("/collections/:id");
  const id = parseInt(params?.id || "0", 10);

  const { data: collection, isLoading: isColLoading } = useGetCollection(id, {
    query: { enabled: !!id, queryKey: getGetCollectionQueryKey(id) },
  });
  const { data: links, isLoading: isLinksLoading } = useListLinks(
    { collectionId: id },
    { query: { enabled: !!id, queryKey: getListLinksQueryKey({ collectionId: id }) } },
  );

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLinksLoading && links?.length && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".link-card");
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, [isLinksLoading, links]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <header className="mb-12">
          {isColLoading ? (
            <div className="h-10 w-64 bg-muted animate-pulse rounded-md mb-2" />
          ) : (
            <>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded-sm"
                  style={{ backgroundColor: collection?.color || "var(--secondary)" }}
                />
                {collection?.name}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                {collection?.description || `${links?.length || 0} items in this collection.`}
              </p>
            </>
          )}
        </header>

        {isLinksLoading ? (
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
            <p className="text-muted-foreground text-sm">This collection is empty.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}