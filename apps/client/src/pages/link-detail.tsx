import { useEffect, useRef, useState } from "react";
import { useRoute, Link as WouterLink } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetLink,
  useUpdateLink,
  useDeleteLink,
  useUpdateLinkStatus,
  getGetLinkQueryKey,
  getListLinksQueryKey,
  getGetLinkStatsQueryKey,
  useEnrichLink,
} from "@stashd/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, ExternalLink, Sparkles, Trash2, Loader2, Tags, Folder } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getHostname } from "@/lib/utils";

export default function LinkDetail() {
  const [, params] = useRoute("/link/:id");
  const id = parseInt(params?.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: link, isLoading } = useGetLink(id, {
    query: {
      enabled: !!id,
      queryKey: getGetLinkQueryKey(id),
    },
  });

  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const updateStatus = useUpdateLinkStatus();
  const enrichLink = useEnrichLink();

  const [notes, setNotes] = useState("");
 const notesTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (link?.notes !== undefined) {
      setNotes(link.notes || "");
    }
  }, [link?.notes]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      updateLink.mutate(
        { id, data: { notes: val } },
        {
          onSuccess: (data) => {
            queryClient.setQueryData(getGetLinkQueryKey(id), data);
          },
        },
      );
    }, 1000);
  };

  const handleStatusChange = (status: "to_read" | "reading" | "done") => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetLinkQueryKey(id), data);
          queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetLinkStatsQueryKey() });
          toast({ title: `Status updated to ${status.replace("_", " ")}` });
        },
      },
    );
  };

  const handleEnrich = () => {
    enrichLink.mutate(
      { id },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetLinkQueryKey(id), data);
          toast({ title: "Link enriched with AI summary and tags!" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!link) {
    return (
      <AppLayout>
        <div className="p-8">Link not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-8 md:p-12 pb-24">
        <WouterLink href="/">
          <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vault
          </Button>
        </WouterLink>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {link.imageUrl ? (
              <div className="w-full md:w-1/3 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border shrink-0 relative">
                <img src={link.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full md:w-1/3 aspect-video md:aspect-[4/3] rounded-xl bg-muted border border-border shrink-0 flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            )}

            <div className="flex-1 space-y-6 w-full">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {link.favicon && <img src={link.favicon} alt="" className="h-5 w-5 rounded-sm" />}
                  <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                      {link.siteName || getHostname(link.url)}  
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {format(new Date(link.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4 text-foreground">
                  {link.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                      Visit Link <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>

                  <div className="flex bg-muted rounded-md p-1">
                    {(["to_read", "reading", "done"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors ${
                          link.status === s
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {link.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{link.description}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {link.readingTimeMinutes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md font-mono">
                    <Clock className="h-4 w-4" /> {link.readingTimeMinutes} min read
                  </div>
                )}
                {link.collectionName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md font-mono">
                    <Folder className="h-4 w-4" /> {link.collectionName}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-secondary" /> AI Summary
                  </h3>
                  {!link.aiSummary && !enrichLink.isPending && (
                    <Button variant="outline" size="sm" onClick={handleEnrich}>
                      Generate Summary
                    </Button>
                  )}
                  {enrichLink.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {link.aiSummary ? (
                  <p className="text-muted-foreground leading-relaxed">{link.aiSummary}</p>
                ) : (
                  <p className="text-muted-foreground/60 italic">
                    {enrichLink.isPending ? "Generating..." : "No summary generated yet."}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg">Personal Notes</h3>
                <Textarea
                  placeholder="Jot down your thoughts about this link..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[150px] bg-card resize-y text-base"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2 mb-4">
                  <Tags className="h-5 w-5 text-muted-foreground" /> Tags
                </h3>
                {link.tags && link.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {link.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">No tags added.</p>
                )}
              </div>

              <div className="pt-8 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                  onClick={() => {
                    if (confirm("Delete this link?")) {
                      deleteLink.mutate(
                        { id },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
                            queryClient.invalidateQueries({ queryKey: getGetLinkStatsQueryKey() });
                            window.location.href = "/";
                          },
                        },
                      );
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}