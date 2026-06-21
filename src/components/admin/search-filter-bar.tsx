"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, Rows3, Save, Search, Trash2, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  resultCount?: number;
  resultLabel?: string;
  savedViews?: boolean;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
}

type SavedView = {
  id: string;
  name: string;
  query: string;
};

export function SearchFilterBar({
  placeholder = "Search...",
  resultCount,
  resultLabel = "results",
  savedViews = true,
  filters = [],
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queryInput, setQueryInput] = useState(searchParams.get("q") ?? "");
  const [views, setViews] = useState<SavedView[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string>("NONE");
  const [density, setDensity] = useState<"cozy" | "compact">("cozy");

  const savedViewsKey = `crm-saved-views:${pathname}`;

  useEffect(() => {
    setQueryInput(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(savedViewsKey);
    if (!raw) {
      setViews([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SavedView[];
      if (Array.isArray(parsed)) setViews(parsed);
    } catch {
      setViews([]);
    }
  }, [savedViewsKey]);

  useEffect(() => {
    const rawDensity = localStorage.getItem("crm-table-density");
    const nextDensity = rawDensity === "compact" ? "compact" : "cozy";
    setDensity(nextDensity);
    document.documentElement.classList.remove("table-density-cozy", "table-density-compact");
    document.documentElement.classList.add(`table-density-${nextDensity}`);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTypingTarget) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQueryInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("q", value), 220);
  }

  function clearAll() {
    setQueryInput("");
    setSelectedViewId("NONE");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  function persistViews(nextViews: SavedView[]) {
    setViews(nextViews);
    localStorage.setItem(savedViewsKey, JSON.stringify(nextViews));
  }

  function saveCurrentView() {
    const query = searchParams.toString();
    if (!query) return;

    const input = window.prompt("Name this saved view:");
    const name = input?.trim();
    if (!name) return;

    const nextView: SavedView = {
      id: `${Date.now()}`,
      name,
      query,
    };

    const nextViews = [nextView, ...views].slice(0, 12);
    persistViews(nextViews);
    setSelectedViewId(nextView.id);
  }

  function applySavedView(viewId: string) {
    setSelectedViewId(viewId);
    if (viewId === "NONE") {
      startTransition(() => router.replace(pathname));
      return;
    }

    const view = views.find((v) => v.id === viewId);
    if (!view) return;
    setQueryInput(new URLSearchParams(view.query).get("q") ?? "");

    startTransition(() => {
      router.replace(view.query ? `${pathname}?${view.query}` : pathname);
    });
  }

  function deleteSavedView() {
    if (selectedViewId === "NONE") return;
    const nextViews = views.filter((v) => v.id !== selectedViewId);
    persistViews(nextViews);
    setSelectedViewId("NONE");
  }

  function setTableDensity(nextDensity: "cozy" | "compact") {
    setDensity(nextDensity);
    localStorage.setItem("crm-table-density", nextDensity);
    document.documentElement.classList.remove("table-density-cozy", "table-density-compact");
    document.documentElement.classList.add(`table-density-${nextDensity}`);
  }

  const hasFilters = searchParams.toString().length > 0;
  const activeItems = useMemo(() => {
    const chips: Array<{ key: string; label: string; value: string }> = [];
    const q = searchParams.get("q");
    if (q) chips.push({ key: "q", label: "Search", value: q });

    for (const filter of filters) {
      const selected = searchParams.get(filter.key);
      if (!selected || selected === "ALL") continue;
      const optionLabel = filter.options.find((o) => o.value === selected)?.label ?? selected;
      chips.push({ key: filter.key, label: filter.label, value: optionLabel });
    }
    return chips;
  }, [filters, searchParams]);

  function removeChip(key: string) {
    if (key === "q") {
      setQueryInput("");
    }
    update(key, "");
  }

  return (
    <div className="rounded-xl border bg-card/60 p-3 md:p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          {isPending ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          )}
          <Input
            ref={inputRef}
            className="pl-9"
            placeholder={placeholder}
            value={queryInput}
            onChange={handleSearch}
          />
        </div>
        {filters.map((f) => (
          <Select
            key={f.key}
            value={searchParams.get(f.key) ?? "ALL"}
            onValueChange={(v) => update(f.key, v)}
          >
            <SelectTrigger className="w-[170px] bg-background">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All {f.label}s</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}

        {savedViews && (
          <>
            <Select value={selectedViewId} onValueChange={applySavedView}>
              <SelectTrigger className="w-[190px] bg-background">
                <SelectValue placeholder="Saved views" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No saved view</SelectItem>
                {views.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentView}
              disabled={!hasFilters}
            >
              <Save className="w-4 h-4 mr-1" />
              Save View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSavedView}
              disabled={selectedViewId === "NONE"}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        <div className="ml-auto inline-flex items-center rounded-md border bg-background p-1">
          <Button
            size="sm"
            variant={density === "cozy" ? "secondary" : "ghost"}
            className="h-7 px-2"
            onClick={() => setTableDensity("cozy")}
          >
            <Rows3 className="w-4 h-4" />
            <span className="ml-1">Cozy</span>
          </Button>
          <Button
            size="sm"
            variant={density === "compact" ? "secondary" : "ghost"}
            className="h-7 px-2"
            onClick={() => setTableDensity("compact")}
          >
            <Rows3 className="w-4 h-4" />
            <span className="ml-1">Compact</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>Press / to focus search</span>
          {savedViews && <span className="inline-flex items-center gap-1"><Bookmark className="w-3 h-3" /> Views are saved per page</span>}
          {activeItems.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-foreground hover:bg-muted"
            >
              {chip.label}: {chip.value}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
        {typeof resultCount === "number" && (
          <span className="font-medium text-foreground">
            {resultCount} {resultLabel}
          </span>
        )}
      </div>
    </div>
  );
}
