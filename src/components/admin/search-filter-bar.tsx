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
import { Loader2, Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  resultCount?: number;
  resultLabel?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
}

export function SearchFilterBar({
  placeholder = "Search...",
  resultCount,
  resultLabel = "results",
  filters = [],
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queryInput, setQueryInput] = useState(searchParams.get("q") ?? "");

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
    startTransition(() => {
      router.replace(pathname);
    });
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>Press / to focus search</span>
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
