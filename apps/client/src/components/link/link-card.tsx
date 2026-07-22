import { useRef } from "react";
import { Link } from "wouter";
import { Link as LinkType } from "@stashd/api-client";
import { Clock, Sparkles, Trash2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, getHostname } from "@/lib/utils";


interface LinkCardProps {
  link: LinkType;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
  onDeleteClick?: (id: number) => void;
}

export function LinkCard({ link, selectMode, selected, onToggleSelect, onDeleteClick }: LinkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const cardInner = (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl border overflow-hidden hover-elevate transition-all duration-300 link-card",
        selected ? "border-secondary ring-2 ring-secondary/30" : "border-border",
      )}
    >
      {selectMode ? (
        <button
          onClick={() => onToggleSelect?.(link.id)}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="Select link"
        />
      ) : (
        <Link href={`/link/${link.id}`} className="absolute inset-0 z-10" />
      )}

      {selectMode && (
        <div
          className={cn(
            "absolute top-3 left-3 z-20 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected ? "bg-secondary border-secondary" : "bg-background/80 border-border backdrop-blur-sm",
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}

      {!selectMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteClick?.(link.id);
          }}
          className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:border-destructive/40 transition-all"
          title="Delete link"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {link.imageUrl ? (
        <div className="aspect-[16/10] w-full relative bg-muted overflow-hidden border-b border-border/50">
          <img
            src={link.imageUrl}
            alt={link.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {link.isStale && (
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-muted-foreground border border-border/50">
              Stale
            </div>
          )}
        </div>
      ) : (
        <div className="h-4" />
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {link.favicon && <img src={link.favicon} alt="" className="h-4 w-4 rounded-sm" />}
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider truncate">
            {link.siteName || getHostname(link.url)}
          </span>
        </div>

        <h3 className="font-display font-semibold text-lg leading-tight mb-2 text-foreground group-hover:text-secondary transition-colors">
          {link.title}
        </h3>

        {link.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{link.description}</p>
        )}

        {link.aiSummary && !link.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 flex items-start gap-1">
            <Sparkles className="h-3 w-3 text-secondary shrink-0 mt-1" />
            <span>{link.aiSummary}</span>
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/30">
          <div className="flex items-center gap-3">
            <span>{formatDistanceToNow(new Date(link.createdAt))} ago</span>
            {link.readingTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {link.readingTimeMinutes}m
              </span>
            )}
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
              link.status === "to_read"
                ? "bg-secondary/10 text-secondary"
                : link.status === "reading"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {link.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );

  return cardInner;
}