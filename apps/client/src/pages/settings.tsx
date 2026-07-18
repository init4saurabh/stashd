import { AppLayout } from "@/components/layout/app-layout";
import { Settings as SettingsIcon, Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const themeOptions: { value: Theme; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean white background, always on",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Deep ink background, easy on the eyes",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follows your OS preference automatically",
    icon: Monitor,
  },
];

export default function Settings() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-secondary" /> Settings
          </h1>
          <p className="text-muted-foreground font-mono text-sm">Manage your Stashd preferences.</p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-1">Appearance</h2>
            <p className="text-sm text-muted-foreground mb-4">Choose how Stashd looks to you.</p>

            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      isActive
                        ? "border-secondary bg-secondary/5"
                        : "border-border bg-card hover:border-muted-foreground/40",
                    )}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        isActive ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground font-mono">
              Currently displaying: <span className="text-foreground capitalize">{resolvedTheme}</span> mode
            </p>
          </section>

          <div className="border-t border-border" />

          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-1">About</h2>
            <p className="text-sm text-muted-foreground mb-4">Stashd — your personal digital archive.</p>
            <div className="bg-muted rounded-xl p-4 space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>AI model</span>
                <span className="text-foreground">Gemini 1.5 Flash</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="text-foreground">PostgreSQL</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}