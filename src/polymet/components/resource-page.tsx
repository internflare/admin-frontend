import { useCallback, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect } from "@/polymet/components/data-table";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { StatusBadge } from "@/polymet/components/status-badge";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { fieldValue, fetchCollection, mutateAdmin, recordId, type AdminRecord, type QueryParams, type ResourceDefinition, type ResourceField } from "@/polymet/lib/admin-service";

export function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Not supplied";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function FieldValue({ record, field }: { record: AdminRecord; field: ResourceField }) {
  const value = fieldValue(record, field.key);
  if (value === undefined || value === null || value === "") return <span className="text-muted-foreground">Not supplied</span>;
  let content: ReactNode = displayValue(value);
  if (field.format === "date" && typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    content = new Date(value).toLocaleString();
  } else if (field.format === "status") {
    content = <StatusBadge status={String(value)} />;
  } else if (field.format === "money" && typeof value === "number") {
    content = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  const href = field.href?.(record);
  return href ? <Link className="hover:underline" to={href}>{content}</Link> : <span className="break-words">{content}</span>;
}

export function ResourcePage({ resource, initialParams = {}, title, actions, summary, rowActions }: {
  resource: ResourceDefinition;
  initialParams?: QueryParams;
  title?: string;
  actions?: ReactNode;
  summary?: ReactNode;
  /** Page-specific row actions; `refresh` reloads the current page of records. */
  rowActions?: (record: AdminRecord, refresh: () => void) => ReactNode;
}) {
  const { can } = useAdminRole();
  const [urlParams] = useSearchParams();
  const permission = !can(resource.permission) && resource.alternativePermission ? resource.alternativePermission : resource.permission;
  return <PermissionGuard permission={permission}><ResourceContent key={`${resource.endpoint}:${JSON.stringify(initialParams)}:${urlParams.toString()}`} resource={resource} initialParams={initialParams} title={title} actions={actions} summary={summary} rowActions={rowActions} /></PermissionGuard>;
}

function ResourceContent({ resource, initialParams, title, actions, summary, rowActions }: {
  resource: ResourceDefinition; initialParams: QueryParams; title?: string; actions?: ReactNode; summary?: ReactNode;
  rowActions?: (record: AdminRecord, refresh: () => void) => ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(resource.search ? searchParams.get("search") ?? "" : "");
  const [query, setQuery] = useState(search);
  const [filters, setFilters] = useState<QueryParams>(() => Object.fromEntries(
    (resource.filters ?? []).filter((filter) => filter.defaultValue && initialParams[filter.key] === undefined).map((filter) => [filter.key, filter.defaultValue]),
  ));
  const [selected, setSelected] = useState<AdminRecord | null>(null);
  const [resolution, setResolution] = useState("Settled");
  const [featureState, setFeatureState] = useState("Disabled");
  const paramsKey = JSON.stringify({ ...initialParams, ...filters, ...(resource.search ? { search: query } : {}), page, limit: 20 });
  const fetcher = useCallback(() => fetchCollection(resource, JSON.parse(paramsKey)), [resource, paramsKey]);
  const result = useAdminQuery(fetcher);
  const pagination = result.data?.pagination;
  const reconciliation = resource.endpoint === "/finance/reconciliation";
  const features = resource.endpoint === "/settings/features";

  return (
    <div className="space-y-5">
      <PageHeader title={title ?? resource.title} description="Live backend records. Missing fields are labelled; failed requests are never replaced with sample data." actions={
        <><Button variant="outline" size="sm" onClick={result.retry} disabled={result.loading}>Refresh</Button>{actions}</>
      } />
      {summary}
      {resource.note && <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{resource.note}</p>}
      {resource.search && (
        <form className="flex max-w-lg gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
          <Input aria-label={`Search ${resource.title}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search backend records…" />
          <Button type="submit" variant="outline">Search</Button>
        </form>
      )}
      <DataTable
        data={result.data?.records} loading={result.loading} error={result.error} onRetry={result.retry}
        pageSize={resource.paginated ? 20 : 25} serverPaginated={resource.paginated} getRowId={recordId}
        emptyTitle="No records returned" emptyDescription="The backend successfully returned no records for this query."
        columns={resource.fields.map((field) => ({ key: field.key, header: field.label, cell: (record: AdminRecord) => <FieldValue record={record} field={field} /> }))}
        toolbar={resource.filters?.map((filter) => {
          const current = filters[filter.key] ?? initialParams[filter.key];
          return (
            <FilterSelect key={filter.key} label={filter.label} allLabel={filter.allLabel}
              value={current === undefined || (filter.allValue !== undefined && current === filter.allValue) ? "all" : String(current)}
              options={filter.options} onChange={(value) => { setFilters((previous) => ({ ...previous, [filter.key]: value === "all" ? filter.allValue : value })); setPage(1); }} />
          );
        })}
        rowActions={rowActions ? (record) => rowActions(record, result.retry) : resource.detailPath || reconciliation || features ? (record) => (
          resource.detailPath ? <Button asChild size="sm" variant="outline"><Link to={`${resource.detailPath}/${encodeURIComponent(recordId(record))}`}>View record</Link></Button>
            : features ? <PermissionButton permission="system.manage" variant="outline" size="sm" disabled={record.isLocked === true || typeof record.key !== "string"} onClick={() => { setSelected(record); setFeatureState(String(record.state)); }}>Change state…</PermissionButton>
            : <PermissionButton permission="finance.manage" variant="outline" size="sm" disabled={record.status !== "Unresolved" || typeof record.id !== "string"} onClick={() => setSelected(record)}>Resolve…</PermissionButton>
        ) : undefined}
      />
      {!result.loading && !result.error && pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>{pagination.total.toLocaleString()} matching records · Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      )}
      {selected && (
          <ConfirmActionDialog key={recordId(selected)} open onOpenChange={(open) => { if (!open) setSelected(null); }} title={features ? "Change feature configuration" : "Resolve reconciliation"} target={displayValue(features ? selected.key : selected.id)}
            description={features ? "This changes the recorded flag configuration; it does not verify end-to-end feature availability. Server compliance locks still apply." : "Records a reconciliation outcome. This does not initiate a payment or refund."}
            onConfirm={async ({ note }) => {
              if (features) {
                await mutateAdmin(`/settings/features/${encodeURIComponent(String(selected.key))}`, { state: featureState, note }, "patch");
              } else {
                await mutateAdmin(`/finance/reconciliation/${encodeURIComponent(String(selected.id))}/settle`, { resolution, note });
              }
              toast.success("Change confirmed by the backend");
              result.retry();
            }}>
            <label className="block space-y-1 text-sm">{features ? "Feature state" : "Resolution"}
              <select aria-label={features ? "Feature state" : "Reconciliation resolution"} className="block w-full rounded-md border bg-background p-2 text-sm" value={features ? featureState : resolution} onChange={(event) => features ? setFeatureState(event.target.value) : setResolution(event.target.value)}>
                {(features ? ["Enabled", "Disabled", "Planned", "Awaiting configuration"] : ["Settled", "Written_Off", "Escalated"]).map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </ConfirmActionDialog>
      )}
    </div>
  );
}
