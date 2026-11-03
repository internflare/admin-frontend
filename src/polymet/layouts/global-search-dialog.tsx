import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { ADMIN_NAV } from "@/polymet/data/admin-nav";
import { displayValue } from "@/polymet/components/resource-page";
import { fetchCollection, recordId, resources, type ResourceDefinition } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { Skeleton } from "@/components/ui/skeleton";

const SEARCHABLE = [
  { resource: resources.users, path: "/users", titleKey: "name" },
  { resource: resources.companies, path: "/companies", titleKey: "name" },
  { resource: resources.listings, path: "/listings", titleKey: "title" },
  { resource: resources.workspaces, path: "/workspaces", titleKey: "name" },
  { resource: resources.mentors, path: "/mentors", titleKey: "name" },
  { resource: resources.supervisors, path: "/supervisors", titleKey: "name" },
  { resource: resources.transactions, path: "/transactions", titleKey: "id" },
  { resource: resources.audit, path: "/audit-logs", titleKey: "action" },
] satisfies { resource: ResourceDefinition; path: string; titleKey: string }[];

function SearchResults({ resource, path, titleKey, query, go }: typeof SEARCHABLE[number] & { query: string; go: (path: string) => void }) {
  const fetcher = useCallback(() => fetchCollection(resource, { search: query, page: 1, limit: 5 }), [resource, query]);
  const result = useAdminQuery(fetcher);
  return <CommandGroup heading={resource.title}>
    {result.loading ? <div role="status" aria-busy="true" aria-label="Searching backend" className="space-y-3 px-2 py-2"><span className="sr-only">Searching backend</span>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div> :
      result.error ? <div className="px-2 py-2 text-xs" role="alert"><p className="text-destructive">{result.error}</p><Button size="sm" variant="outline" onClick={result.retry}>Retry</Button></div> :
        result.data?.records.length === 0 ? <p className="px-2 py-2 text-xs text-muted-foreground">No matching records returned.</p> :
          result.data?.records.map((record) => <CommandItem key={recordId(record)} value={`${resource.endpoint}:${recordId(record)}`} onSelect={() => go("detailPath" in resource ? `${resource.detailPath}/${encodeURIComponent(recordId(record))}` : `${path}?search=${encodeURIComponent(query)}`)}>
            <div className="min-w-0"><p className="truncate">{displayValue(record[titleKey])}</p><p className="truncate font-mono text-[11px] text-muted-foreground">{recordId(record)}</p></div>
          </CommandItem>)}
    {result.data && <CommandItem value={`all:${path}`} onSelect={() => go(`${path}?search=${encodeURIComponent(query)}`)}>Open directory · {result.data.pagination?.total.toLocaleString()} matching records</CommandItem>}
  </CommandGroup>;
}

export function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { can } = useAdminRole();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setSubmittedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);
  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };
  const modules = ADMIN_NAV.flatMap((section) => section.items).filter((item) => (can(item.permission) || (item.alternativePermission && can(item.alternativePermission))) && item.title.toLowerCase().includes(query.toLowerCase()));
  return <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
    <CommandInput value={query} onValueChange={setQuery} placeholder="Find modules or search backend directories…" />
    <CommandList className="max-h-[420px]">
      <CommandEmpty>No matching modules.</CommandEmpty>
      <CommandGroup heading="Go to module">{modules.map((item) => <CommandItem key={item.href} value={`module:${item.href}`} onSelect={() => go(item.href)}><item.icon className="mr-2 size-4 text-muted-foreground" />{item.title}</CommandItem>)}</CommandGroup>
      <CommandSeparator />
      {open && submittedQuery.length >= 2 && submittedQuery === query.trim() ? SEARCHABLE.filter(({ resource }) => can(resource.permission)).map((group) => <SearchResults key={`${group.path}:${submittedQuery}`} {...group} query={submittedQuery} go={go} />) : <p className="p-3 text-xs text-muted-foreground">Enter at least two characters to search authorised backend directories.</p>}
    </CommandList>
    <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Each directory uses its supported server-side search fields; ID search is not universal. Up to five results per directory. Subscriptions, support, alerts and other unsupported datasets are unavailable.</div>
  </CommandDialog>;
}
