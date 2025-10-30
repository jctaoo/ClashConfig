import { useEffect, useState } from "react";
import { Switch } from "@/client/components/ui/switch";
import { Separator } from "@/client/components/ui/separator";

export function AppHeader() {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">ClashConfig</span>
          <Separator orientation="vertical" className="mx-2 h-5" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Dark</span>
          <Switch checked={dark} onCheckedChange={setDark} aria-label="Toggle theme" />
        </div>
      </div>
      <Separator />
    </header>
  );
}

