import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { ADMIN_NAV } from "@/polymet/data/admin-nav";
import { displayValue } from "@/polymet/components/resource-page";
import { fetchCollection, fieldValue, recordId, resources, type ResourceDefinition } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { Spinner } from "@/components/ui/spinner";
import { useAdminSearch } from "@/polymet/lib/use-admin-search";

const SEARCHABLE = (Object.values(resources) as ResourceDefinition[])
  .filter((resource) => resource.search && resource.searchPath && resource.searchTitleKey)
  .map((resource) => ({
    resource,
    path: resource.searchPath!,
    titleKey: resource.searchTitleKey!,
  }));

function SearchResults({ resource, path, titleKey, query, go }: typeof SEARCHABLE[number] & { query: string; go: (path: string) => void }) {
  const fetcher = useCallback((signal: AbortSignal) => fetchCollection(resource, { search: query, page: 1, limit: 5 }, signal), [resource, query]);
  const result = useAdminQuery(fetcher);
  return <CommandGroup heading={resource.title}>
    {result.loading ? <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground"><Spinner aria-label="Searching backend" /> Searching…</div> :
      result.error ? <div className="px-2 py-2 text-xs" role="alert"><p className="text-destructive">{result.error}</p><Button size="sm" variant="outline" onClick={result.retry}>Retry</Button></div> :
        result.data?.records.length === 0 ? <p className="px-2 py-2 text-xs text-muted-foreground">No matching records returned.</p> :
          result.data?.records.map((record) => <CommandItem key={recordId(record)} value={`${resource.endpoint}:${recordId(record)}`} onSelect={() => go(resource.detailPath ? `${resource.detailPath}/${encodeURIComponent(recordId(record))}` : `${path}?search=${encodeURIComponent(query)}`)}>
            <div className="min-w-0"><p className="truncate">{displayValue(fieldValue(record, titleKey))}</p><p className="truncate font-mono text-[11px] text-muted-foreground">{recordId(record)}</p></div>
          </CommandItem>)}
    {result.data && <CommandItem value={`all:${path}`} onSelect={() => go(`${path}?search=${encodeURIComponent(query)}`)}>Open directory · {result.data.pagination?.total.toLocaleString()} matching records</CommandItem>}
  </CommandGroup>;
}

export function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { can } = useAdminRole();
  const search = useAdminSearch();
  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };
  const modules = ADMIN_NAV.flatMap((section) => section.items).filter((item) => (can(item.permission) || (item.alternativePermission && can(item.alternativePermission))) && item.title.toLowerCase().includes(search.input.toLowerCase()));
  const canSearch = (resource: ResourceDefinition) =>
    can(resource.permission) || Boolean(resource.alternativePermission && can(resource.alternativePermission));
  return <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
    <CommandInput value={search.input} onValueChange={search.update} placeholder="Find modules or search backend records…" />
    <CommandList className="max-h-[420px]">
      <CommandEmpty>No matching modules.</CommandEmpty>
      <CommandGroup heading="Go to module">{modules.map((item) => <CommandItem key={item.href} value={`module:${item.href}`} onSelect={() => go(item.href)}><item.icon className="mr-2 size-4 text-muted-foreground" />{item.title}</CommandItem>)}</CommandGroup>
      <CommandSeparator />
      {open && search.state.phase === "ready" && search.state.query
        ? SEARCHABLE.filter(({ resource }) => canSearch(resource)).map((group) => <SearchResults key={`${group.path}:${search.state.query}`} {...group} query={search.state.query!} go={go} />)
        : search.state.phase === "pending"
          ? <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground" role="status"><Spinner aria-label="Searching" /></div>
          : search.state.phase === "too-short"
            ? <p className="p-3 text-xs text-muted-foreground" role="status">Enter at least 3 characters. Short searches are not sent.</p>
            : search.state.phase === "too-long"
              ? <p className="p-3 text-xs text-destructive" role="alert">Search must be 100 characters or fewer.</p>
              : <p className="p-3 text-xs text-muted-foreground">Enter at least 3 characters to search authorised backend directories.</p>}
    </CommandList>
    <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Each directory searches real backend records through its supported endpoint; ID search is not universal. Up to five results per directory. Plans, reconciliation, admin settings, alerts and other domains without a search contract remain unavailable.</div>
  </CommandDialog>;
}
