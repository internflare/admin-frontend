import { useMemo, useState, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, TableSkeleton } from "@/polymet/components/state-views";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null;
  className?: string;
  headerClassName?: string;
  /** Hide below the md breakpoint to keep mobile tables readable. */
  hideOnMobile?: boolean;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  toolbar?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  className?: string;
  dense?: boolean;
}

export function DataTable<T>({
  data, columns, getRowId, loading, error, onRetry, searchPlaceholder = "Search…", getSearchText, toolbar,
  rowActions, onRowClick, pageSize: initialPageSize = 10, emptyTitle = "No records match", emptyDescription = "Try adjusting search or filters.",
  emptyAction, initialSort, className, dense,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const processed = useMemo(() => {
    let rows = data ?? [];
    if (query && getSearchText) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => getSearchText(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av === bv) return 0;
          if (av === null) return 1;
          if (bv === null) return -1;
          const res = av > bv ? 1 : -1;
          return sort.dir === "asc" ? res : -res;
        });
      }
    }
    return rows;
  }, [data, query, sort, columns, getSearchText]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = processed.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card shadow-xs", className)}>
      {(getSearchText || toolbar) && (
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center">
          {getSearchText && (
            <div className="relative w-full lg:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-8 pl-8 text-sm"
              />
            </div>
          )}
          {toolbar && <div className="flex flex-1 flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {loading ? (
        <TableSkeleton columns={Math.min(columns.length, 6)} />
      ) : error ? (
        <ErrorState description={error} onRetry={onRetry} />
      ) : processed.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  return (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "h-9 whitespace-nowrap text-xs font-medium",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.align === "right" && "text-right",
                        col.headerClassName,
                      )}
                      aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    >
                      {col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active && "text-foreground",
                          )}
                        >
                          {col.header}
                          {active ? (
                            sort!.dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />
                          ) : (
                            <ArrowUpDownIcon className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
                {rowActions && <TableHead className="h-9 w-12 text-right text-xs"><span className="sr-only">Actions</span></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter") onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        dense ? "py-2" : "py-2.5",
                        "text-sm",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.align === "right" && "text-right tabular-nums",
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && processed.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground sm:flex-row">
          <span>
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, processed.length)} of {processed.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-7 w-[64px] text-xs" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="tabular-nums">Page {safePage + 1} / {pageCount}</span>
            <Button variant="outline" size="icon" className="size-7 bg-background" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="size-7 bg-background" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page">
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}

/** Compact labelled select for table toolbars. "all" means no filter. */
export function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[140px] gap-1 text-xs" aria-label={label}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel ?? "All"}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function matchesFilter(value: string, filter: string) {
  return filter === "all" || value === filter;
}
