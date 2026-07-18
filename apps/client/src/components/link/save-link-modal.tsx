import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Link2, Loader2 } from "lucide-react";
import {
  useCreateLink,
  useScrapeUrl,
  getListLinksQueryKey,
  getGetLinkStatsQueryKey,
} from "@stashd/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { BookmarkAnimation } from "@/components/ui/bookmark-animation";

export function SaveLinkModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const queryClient = useQueryClient();

  const scrapeUrl = useScrapeUrl();
  const createLink = useCreateLink();

  const handleScrape = () => {
    if (!url) return;
    scrapeUrl.mutate({ data: { url } });
  };

  const handleSave = () => {
    if (!url || !scrapeUrl.data) return;

    createLink.mutate(
      {
        data: {
          url,
          title: scrapeUrl.data.title || url,
          description: scrapeUrl.data.description || undefined,
          imageUrl: scrapeUrl.data.imageUrl || undefined,
          siteName: scrapeUrl.data.siteName || undefined,
          favicon: scrapeUrl.data.favicon || undefined,
          readingTimeMinutes: scrapeUrl.data.readingTimeMinutes || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowAnimation(true);
          setTimeout(() => {
            setShowAnimation(false);
            setOpen(false);
            setUrl("");
            scrapeUrl.reset();
          }, 1500);
          queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetLinkStatsQueryKey() });
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover-elevate-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-display">Save a link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Paste a URL to add it to your vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                  className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-secondary text-base py-6"
                />
              </div>
              <Button
                onClick={handleScrape}
                disabled={!url || scrapeUrl.isPending}
                className="h-auto px-6 bg-primary text-primary-foreground"
              >
                {scrapeUrl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
              </Button>
            </div>

            {scrapeUrl.isPending && <div className="h-32 rounded-lg bg-muted animate-pulse" />}

            {scrapeUrl.data && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {scrapeUrl.data.imageUrl && (
                  <div className="aspect-[2/1] w-full relative bg-muted">
                    <img src={scrapeUrl.data.imageUrl} alt="" className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="p-4 space-y-1.5">
                  {scrapeUrl.data.siteName && (
                    <div className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-2">
                      {scrapeUrl.data.favicon && (
                        <img src={scrapeUrl.data.favicon} className="h-3 w-3" alt="" />
                      )}
                      {scrapeUrl.data.siteName}
                    </div>
                  )}
                  <h3 className="font-medium text-foreground line-clamp-2 leading-tight">
                    {scrapeUrl.data.title || url}
                  </h3>
                  {scrapeUrl.data.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {scrapeUrl.data.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!scrapeUrl.data || createLink.isPending}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8"
              >
                {createLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save to Vault"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showAnimation && <BookmarkAnimation />}
    </>
  );
}