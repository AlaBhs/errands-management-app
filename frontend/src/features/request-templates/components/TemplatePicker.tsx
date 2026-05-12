import { useState, useRef, useEffect } from "react";
import { Search, BookTemplate, X, ChevronDown, Loader2 } from "lucide-react";
import { useMyTemplates } from "../hooks/useTemplates";
import type { RequestTemplateListItemDto } from "../types";
import { cn } from "@/shared/utils/utils";

interface TemplatePickerProps {
  onSelect: (template: RequestTemplateListItemDto) => void;
  onClear: () => void;
  selectedName?: string;
  disabled?: boolean;
}

export function TemplatePicker({ onSelect, onClear, selectedName }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMyTemplates({
    search: search || undefined,
    pageSize: 20,
    page: 1,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (template: RequestTemplateListItemDto) => {
    onSelect(template);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setSearch("");
    setOpen(false);
  };

  const templates = data?.items ?? [];
  const hasTemplates = templates.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5",
          "text-sm transition-colors bg-background dark:bg-card",
          "hover:border-indigo-300 dark:hover:border-indigo-700",
          "disabled:opacity-60 disabled:cursor-not-allowed", 
          open
            ? "border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-200 dark:ring-indigo-900"
            : "border-border",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <BookTemplate className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
          {selectedName ? (
            <span className="font-medium text-foreground truncate">{selectedName}</span>
          ) : (
            <span className="text-muted-foreground">Use a template to pre-fill the form…</span>
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {selectedName && (
            <span
              onClick={handleClear}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted
                         transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-xl border border-border",
            "bg-white dark:bg-card shadow-lg overflow-hidden",
          )}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground
                         focus:outline-none"
            />
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          {/* List */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {!isLoading && !hasTemplates && (
              <li className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? "No templates match your search." : "You have no templates yet."}
                </p>
                {!search && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Open a request and click "Save as Template" to create one.
                  </p>
                )}
              </li>
            )}

            {hasTemplates &&
              templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(t)}
                    className="w-full flex items-start justify-between gap-3 px-4 py-2.5
                               text-left hover:bg-muted/60 dark:hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.title}</p>
                    </div>
                    <span
                      className="shrink-0 mt-0.5 rounded-full bg-muted px-2 py-0.5
                                 text-xs text-muted-foreground"
                    >
                      {t.category}
                    </span>
                  </button>
                </li>
              ))}
          </ul>

          {/* Footer hint */}
          {hasTemplates && (
            <div className="border-t border-border px-4 py-2">
              <p className="text-xs text-muted-foreground">
                {data?.totalCount ?? 0} template{data?.totalCount !== 1 ? "s" : ""} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}