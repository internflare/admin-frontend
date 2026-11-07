import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangleIcon, ArrowRightIcon, CheckCircle2Icon, InboxIcon, LockIcon, RotateCwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/polymet/components/metric-card";
import { PageHeader } from "@/polymet/components/page-header";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { SectionCard } from "@/polymet/components/section-card";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/polymet/components/state-views";
import {
  ACTION_PRIORITIES, fetchActionQueue,
  type ActionQueue, type ActionSource,
} from "@/polymet/lib/action-queue-service";
import { formatDateTime, formatNumber } from "@/polymet/lib/format";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";

const ALL = "all";

function age(hours: number) {
  if (hours < 1) return "< 1h";
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function SourcesSummary({ queue, source, onSelect }: { queue: ActionQueue; source: string; onSelect: (source: ActionSource) => void }) {
  return (
    <SectionCard title="Sources" description="Open records per module" contentClassName="p-0">
      <ul className="divide-y border-t">
        {queue.sources.map((entry) => (
          <li key={entry.source} className="flex items-center gap-3 px-4 py-2.5">
            <button
              type="button"
              onClick={() => onSelect(entry.source)}
              className={`min-w-0 flex-1 truncate text-left text-sm hover:underline ${source === entry.source ? "font-semibold" : ""}`}
            >
              {entry.label}
            </button>
            <span className="tabular-nums text-sm font-medium">{formatNumber(entry.total)}</span>
            <Link to={entry.module} className="text-muted-foreground hover:text-foreground" aria-label={`Open ${entry.label}`}>
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </li>
        ))}
        {queue.restrictedSources.map((entry) => (
          <li key={entry.source} className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground">
            <span className="min-w-0 flex-1 truncate text-sm">{entry.label}</span>
            <span className="inline-flex items-center gap-1 text-xs"><LockIcon className="size-3" /> No access</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function QueueContent() {
  const [version, setVersion] = useState(0);
  const [source, setSource] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(() => fetchActionQueue(), [version]);
  const { data: queue, loading, error, retry } = useAdminQuery(fetcher);

  const items = useMemo(
    () => (queue?.items ?? []).filter((item) => (source === ALL || item.source === source) && (priority === ALL || item.priority === priority)),
    [queue, source, priority],
  );
  const totalOpen = queue?.sources.reduce((sum, entry) => sum + entry.total, 0) ?? 0;

  const refresh = (
    <Button variant="outline" size="sm" onClick={() => setVersion((value) => value + 1)} disabled={loading}>
      <RotateCwIcon className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert & action queue"
        description="Open records across the platform that need an administrator, sorted by priority and then age. Every item comes from a live module."
        meta={queue ? <span className="text-xs text-muted-foreground">Updated {formatDateTime(queue.generatedAt)}</span> : undefined}
        actions={refresh}
      />

      {loading ? <LoadingState label="Loading action queue" className="rounded-lg border" /> : error || !queue ? (
        <ErrorState description={error ?? undefined} onRetry={retry} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ACTION_PRIORITIES.map((level) => (
              <button key={level} type="button" className="text-left" onClick={() => setPriority(priority === level ? ALL : level)}>
                <MetricCard
                  label={`${level} priority`}
                  value={formatNumber(queue.priorityCounts[level])}
                  kind="current"
                  icon={level === "Critical" ? AlertTriangleIcon : InboxIcon}
                  footnote={priority === level ? "Filter applied · click to clear" : "Click to filter"}
                />
              </button>
            ))}
          </div>

          {queue.truncated && (
            <Alert>
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Showing the oldest 50 items per source</AlertTitle>
              <AlertDescription>
                There are {formatNumber(totalOpen)} open records in total. Priority counts cover the loaded items; open a module for the full list.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
            <SectionCard
              title="Queue"
              description={`${formatNumber(items.length)} of ${formatNumber(queue.items.length)} loaded items`}
              action={
                <div className="flex flex-wrap gap-2">
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="h-8 w-[200px]" aria-label="Filter by source"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All sources</SelectItem>
                      {queue.sources.map((entry) => <SelectItem key={entry.source} value={entry.source}>{entry.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-8 w-[140px]" aria-label="Filter by priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All priorities</SelectItem>
                      {ACTION_PRIORITIES.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              }
              contentClassName="p-0"
            >
              {queue.items.length === 0 ? (
                <EmptyState
                  title="Nothing needs attention"
                  description="There are no open items in the modules you can access."
                  action={<CheckCircle2Icon className="size-6 text-emerald-600" />}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No items match these filters"
                  action={<Button variant="outline" size="sm" onClick={() => { setSource(ALL); setPriority(ALL); }}>Clear filters</Button>}
                />
              ) : (
                <div className="overflow-x-auto border-t">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[96px]">Priority</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Record</TableHead>
                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                        <TableHead className="w-[64px] text-right">Age</TableHead>
                        <TableHead className="w-[1%] text-right">Next action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell><PriorityBadge priority={item.priority} /></TableCell>
                          <TableCell className="max-w-[360px]">
                            <p className="truncate text-sm font-medium" title={item.title}>{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground" title={item.detail}>{item.detail}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-xs text-muted-foreground">{item.recordType}</p>
                            <p className="font-mono text-xs">{item.recordRef}</p>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell"><StatusBadge status={item.status} /></TableCell>
                          <TableCell className="text-right text-sm tabular-nums" title={formatDateTime(item.createdAt)}>{age(item.ageHours)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm" className="whitespace-nowrap">
                              <Link to={item.href}>{item.nextAction} <ArrowRightIcon className="size-3" /></Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </SectionCard>

            <SourcesSummary queue={queue} source={source} onSelect={(value) => setSource(source === value ? ALL : value)} />
          </div>
        </>
      )}
    </div>
  );
}

export default function ActionQueuePage() {
  return (
    <PermissionGuard permission="dashboard.view">
      <QueueContent />
    </PermissionGuard>
  );
}
