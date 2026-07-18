import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Bookmark } from "lucide-react";

export function BookmarkAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !iconRef.current) return;

    const tl = gsap.timeline();

    tl.set(containerRef.current, { autoAlpha: 1 })
      .fromTo(
        iconRef.current,
        { y: -50, scale: 0.5, rotation: -15, autoAlpha: 0 },
        { y: 0, scale: 1.2, rotation: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.7)" }
      )
      .to(iconRef.current, { scale: 1, duration: 0.2, ease: "power2.out" })
      .to(iconRef.current, { y: 20, autoAlpha: 0, duration: 0.3, ease: "power2.in", delay: 0.4 })
      .set(containerRef.current, { autoAlpha: 0 });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center invisible"
    >
      <div 
        ref={iconRef}
        className="bg-secondary text-secondary-foreground p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3"
      >
        <Bookmark className="h-12 w-12 fill-current" />
        <span className="font-display font-bold text-lg tracking-tight">Saved</span>
      </div>
    </div>
  );
}