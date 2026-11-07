import { useCallback, useMemo, useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { ActivityIcon, AlertTriangleIcon, PlayIcon, PlusIcon, RotateCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CHART_COLORS, ChartEmpty, TrendChart } from "@/polymet/components/admin-charts";
import { MetricCard } from "@/polymet/components/metric-card";
import { PageHeader } from "@/polymet/components/page-header";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { displayValue } from "@/polymet/components/resource-page";
import { DetailGrid, SectionCard } from "@/polymet/components/section-card";
import { StatusBadge, type StatusTone } from "@/polymet/components/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/polymet/components/state-views";
import { fetchHealth, isRecord } from "@/polymet/lib/admin-service";
import { formatDateTime, formatNumber, formatRelative } from "@/polymet/lib/format";
import {
  OPERATIONS_RANGES, INCIDENT_SEVERITIES, INCIDENT_STATUSES,
  createIncident, describeProbeError, fetchIncidents, fetchOperationsOverview, postIncidentUpdate, runOperationsChecks,
  type Incident, type IncidentSeverity, type IncidentStatus, type MonitoredTarget, type OperationsOverview, type OperationsRange,
} from "@/polymet/lib/operations-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";

const STATUS_LABEL: Record<MonitoredTarget["status"], { label: string; tone: StatusTone }> = {
  healthy: { label: "Operational", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  down: { label: "Down", tone: "danger" },
  unknown: { label: "No data", tone: "neutral" },
};

const SEVERITY_TONE: Record<IncidentSeverity, StatusTone> = { minor: "warning", major: "brand", critical: "danger" };

const latency = (ms: number | null) => (ms === null ? "—" : `${formatNumber(ms)} ms`);
const percent = (value: number | null) => (value === null ? "—" : `${value.toFixed(value === 100 ? 0 : 2)}%`);

function periodLabel(period: string, range: OperationsRange) {
  return format(parseISO(period), range === "24h" ? "HH:mm" : range === "7d" ? "d MMM HH:mm" : "d MMM");
}

function ProbeBadge({ target }: { target: MonitoredTarget }) {
  const { label, tone } = STATUS_LABEL[target.status];
  return <StatusBadge status={label} tone={tone} />;
}

function ProbeDetail({ target }: { target: MonitoredTarget }) {
  return <span className="text-xs text-muted-foreground">{describeProbeError(target.error) ?? "—"}</span>;
}

/** Status-page style strip: one cell per bucket, coloured by uptime. */
function UptimeStrip({ target, range }: { target: MonitoredTarget; range: OperationsRange }) {
  return (
    <div className="flex h-6 gap-px" role="img" aria-label={`${target.name} uptime history`}>
      {target.history.map((point) => {
        const tone = point.uptimePct === null ? "bg-muted"
          : point.uptimePct >= 99.5 ? "bg-emerald-500"
            : point.uptimePct >= 95 ? "bg-amber-500" : "bg-red-500";
        return (
          <span
            key={point.period}
            className={`min-w-[3px] flex-1 rounded-[2px] ${tone}`}
            title={`${periodLabel(point.period, range)} — ${point.uptimePct === null ? "no checks" : `${percent(point.uptimePct)} up, ${latency(point.avgLatencyMs)} avg`}`}
          />
        );
      })}
    </div>
  );
}

function ServicesSection({ overview }: { overview: OperationsOverview }) {
  return (
    <SectionCard title="Services" description="Each microservice's /health endpoint. Uptime counts every check that wasn't down.">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Uptime</TableHead>
              <TableHead className="text-right">Avg latency</TableHead>
              <TableHead className="text-right">p95</TableHead>
              <TableHead className="min-w-[180px]">History ({overview.bucket} buckets)</TableHead>
              <TableHead>Last check</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overview.services.map((service) => (
              <TableRow key={service.key}>
                <TableCell>
                  <div className="font-medium">{service.name}</div>
                  <ProbeDetail target={service} />
                </TableCell>
                <TableCell><ProbeBadge target={service} /></TableCell>
                <TableCell className="text-right tabular-nums">{percent(service.uptimePct)}</TableCell>
                <TableCell className="text-right tabular-nums">{latency(service.avgLatencyMs)}</TableCell>
                <TableCell className="text-right tabular-nums">{latency(service.p95LatencyMs)}</TableCell>
                <TableCell><UptimeStrip target={service} range={overview.range} /></TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{service.checkedAt ? formatRelative(service.checkedAt) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

function LatencySection({ overview }: { overview: OperationsOverview }) {
  const series = overview.services.map((service, i) => ({ key: service.target, label: service.name, color: CHART_COLORS[i % CHART_COLORS.length] }));
  const data = overview.periods.map((period, index) => {
    const row: Record<string, string | number> = { period: periodLabel(period, overview.range) };
    for (const service of overview.services) {
      const value = service.history[index]?.avgLatencyMs;
      if (typeof value === "number") row[service.target] = value;
    }
    return row;
  });
  const hasData = data.some((row) => Object.keys(row).length > 1);
  return (
    <SectionCard title="Latency history" description={`Average /health response time per ${overview.bucket} bucket, in milliseconds.`}>
      {hasData ? <TrendChart data={data} xKey="period" series={series} height={260} /> : <ChartEmpty message="No latency samples recorded in this period yet." height={260} />}
    </SectionCard>
  );
}

function ProvidersSection({ overview }: { overview: OperationsOverview }) {
  return (
    <SectionCard title="External providers" description="Probed anonymously without credentials, so this shows API reachability, not account or quota health.">
      {overview.providers.length === 0 ? <EmptyState title="No providers monitored" description="Set MONITORED_PROVIDERS on admin-service to add some." /> : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
                <TableHead className="text-right">Response</TableHead>
                <TableHead>Last check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.providers.map((provider) => (
                <TableRow key={provider.key}>
                  <TableCell>
                    <div className="font-medium">{provider.name}</div>
                    <ProbeDetail target={provider} />
                  </TableCell>
                  <TableCell><ProbeBadge target={provider} /></TableCell>
                  <TableCell className="text-right tabular-nums">{percent(provider.uptimePct)}</TableCell>
                  <TableCell className="text-right tabular-nums">{latency(provider.latencyMs)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{provider.checkedAt ? formatRelative(provider.checkedAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}

function QueuesSection({ overview }: { overview: OperationsOverview }) {
  const series = overview.queues.map((queue, i) => ({ key: `q${i}`, label: queue.name, color: CHART_COLORS[i % CHART_COLORS.length] }));
  const data = overview.periods.map((period, index) => {
    const row: Record<string, string | number> = { period: periodLabel(period, overview.range) };
    overview.queues.forEach((queue, i) => {
      const value = queue.history[index]?.maxMessages;
      if (typeof value === "number") row[`q${i}`] = value;
    });
    return row;
  });
  const hasData = data.some((row) => Object.keys(row).length > 1);
  return (
    <SectionCard title="Message queues" description="RabbitMQ depth and consumers. The chart shows the peak ready-message count per bucket.">
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ready messages</TableHead>
                <TableHead className="text-right">Consumers</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.queues.map((queue) => (
                <TableRow key={queue.key}>
                  <TableCell>
                    <div className="break-all font-mono text-xs font-medium">{queue.name}</div>
                    <ProbeDetail target={queue} />
                  </TableCell>
                  <TableCell><ProbeBadge target={queue} /></TableCell>
                  <TableCell className="text-right tabular-nums">{queue.messages === null ? "—" : formatNumber(queue.messages)}</TableCell>
                  <TableCell className="text-right tabular-nums">{queue.consumers === null ? "—" : formatNumber(queue.consumers)}</TableCell>
                  <TableCell className="text-right tabular-nums">{percent(queue.uptimePct)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasData ? <TrendChart data={data} xKey="period" series={series} variant="bar" height={180} /> : <ChartEmpty message="No queue samples recorded in this period yet." height={180} />}
      </div>
    </SectionCard>
  );
}

function IncidentCard({ incident, names, onUpdate }: { incident: Incident; names: Map<string, string>; onUpdate: (incident: Incident) => void }) {
  const [expanded, setExpanded] = useState(incident.status !== "Resolved");
  const timeline = [...incident.timeline].reverse();
  return (
    <li className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{incident.reference}</span>
            <StatusBadge status={incident.status} />
            <StatusBadge status={incident.severity} tone={SEVERITY_TONE[incident.severity]} showDot={false} className="capitalize" />
            {incident.source === "automatic" && <StatusBadge status="Automatic" tone="neutral" showDot={false} />}
          </div>
          <p className="break-words font-medium">{incident.title}</p>
          <p className="text-xs text-muted-foreground">
            Opened {formatDateTime(incident.createdAt)} by {incident.openedBy}
            {incident.resolvedAt && ` · Resolved ${formatDateTime(incident.resolvedAt)}`}
          </p>
          {incident.affected.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {incident.affected.map((key) => <span key={key} className="rounded bg-muted px-1.5 py-0.5 text-xs">{names.get(key) ?? key}</span>)}
            </div>
          )}
          {incident.recoveredAt && incident.status !== "Resolved" && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Checks passing again since {formatDateTime(incident.recoveredAt)}.</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? "Hide timeline" : `Timeline (${incident.timeline.length})`}
          </Button>
          {incident.status !== "Resolved" && (
            <PermissionButton permission="system.manage" variant="outline" size="sm" onClick={() => onUpdate(incident)}>Post update</PermissionButton>
          )}
        </div>
      </div>
      {expanded && (
        <ol className="mt-4 space-y-3 border-l pl-4">
          {timeline.map((update, index) => (
            <li key={`${update.at}-${index}`} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-border" aria-hidden />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={update.status} />
                <span>{formatDateTime(update.at)}</span>
                <span>· {update.actor}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{update.message}</p>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

function IncidentUpdateDialog({ incident, onClose, onSaved }: { incident: Incident | null; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<IncidentStatus>("Identified");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!incident) return;
    setSaving(true);
    try {
      await postIncidentUpdate(incident.id, { status, message: message.trim() });
      toast.success(status === "Resolved" ? `${incident.reference} resolved` : `Update posted to ${incident.reference}`);
      setMessage("");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't post the update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(incident)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Post update</DialogTitle>
            <DialogDescription>{incident ? `${incident.reference} · ${incident.title}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="incident-update-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as IncidentStatus)}>
              <SelectTrigger id="incident-update-status"><SelectValue /></SelectTrigger>
              <SelectContent>{INCIDENT_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-update-message">Message</Label>
            <Textarea id="incident-update-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={4} placeholder="What changed, and what happens next?" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || message.trim().length < 3}>{saving ? "Posting…" : status === "Resolved" ? "Resolve incident" : "Post update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentsSection({ targets, version, onChanged }: { targets: MonitoredTarget[]; version: number; onChanged: () => void }) {
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const [updating, setUpdating] = useState<Incident | null>(null);
  // `version` is a refetch trigger after incidents change elsewhere on the page.
  const fetcher = useCallback(() => fetchIncidents(filter, 1, 20), [filter, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const query = useAdminQuery(fetcher);
  const names = useMemo(() => new Map(targets.map((target) => [target.key, target.name])), [targets]);

  return (
    <SectionCard
      title="Incidents"
      description="Opened automatically after two consecutive failed checks, or manually by an operator. Every manual action is audited."
      action={
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="h-8">
            <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {query.loading ? <LoadingState label="Loading incidents" /> : query.error ? <ErrorState title="Couldn't load incidents" description={query.error} onRetry={query.retry} /> :
        !query.data || query.data.incidents.length === 0 ? (
          <EmptyState
            title={filter === "open" ? "No open incidents" : "No incidents"}
            description={filter === "open" ? "Nothing is currently being investigated. New failures will appear here." : "Nothing recorded yet."}
          />
        ) : (
          <ul className="space-y-3">
            {query.data.incidents.map((incident) => <IncidentCard key={incident.id} incident={incident} names={names} onUpdate={setUpdating} />)}
            {query.data.total > query.data.incidents.length && (
              <li className="text-xs text-muted-foreground">Showing the latest {query.data.incidents.length} of {query.data.total}.</li>
            )}
          </ul>
        )}
      <IncidentUpdateDialog incident={updating} onClose={() => setUpdating(null)} onSaved={() => { setUpdating(null); onChanged(); }} />
    </SectionCard>
  );
}

function CreateIncidentDialog({ open, targets, onClose, onCreated }: { open: boolean; targets: MonitoredTarget[]; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("major");
  const [affected, setAffected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (key: string, checked: boolean) =>
    setAffected((current) => (checked ? [...current, key].slice(0, 10) : current.filter((value) => value !== key)));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const incident = await createIncident({ title: title.trim(), severity, affected, message: message.trim() });
      toast.success(`Incident ${incident.reference} opened`);
      setTitle(""); setSeverity("major"); setAffected([]); setMessage("");
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open the incident");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Report an incident</DialogTitle>
            <DialogDescription>Opens an incident in “Investigating”. This action is recorded in the audit log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="incident-title">Title</Label>
            <Input id="incident-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="e.g. Payments failing at checkout" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-severity">Severity</Label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as IncidentSeverity)}>
              <SelectTrigger id="incident-severity" className="capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{INCIDENT_SEVERITIES.map((value) => <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Affected components <span className="font-normal text-muted-foreground">(up to 10)</span></legend>
            <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
              {targets.map((target) => (
                <label key={target.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={affected.includes(target.key)}
                    onCheckedChange={(checked) => toggle(target.key, checked === true)}
                    disabled={!affected.includes(target.key) && affected.length >= 10}
                  />
                  <span className="truncate">{target.name}</span>
                  <span className="text-xs capitalize text-muted-foreground">{target.kind}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="incident-message">First update</Label>
            <Textarea id="incident-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={4} placeholder="What's happening and who is affected?" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || title.trim().length < 5 || message.trim().length < 5}>{saving ? "Opening…" : "Open incident"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminServiceDependencies() {
  const query = useAdminQuery(fetchHealth);
  return (
    <SectionCard title="Admin-service dependencies" description="Live connection state of the admin service's own database, cache and broker.">
      {query.loading ? <LoadingState label="Checking dependencies" className="py-6" /> : query.error ? <ErrorState description={query.error} onRetry={query.retry} /> : query.data && (
        <DetailGrid
          columns={3}
          items={[
            { label: "status", value: displayValue(query.data.status) },
            ...(isRecord(query.data.dependencies) ? Object.entries(query.data.dependencies).map(([label, value]) => ({ label, value: displayValue(value) })) : []),
          ]}
        />
      )}
    </SectionCard>
  );
}

function HealthContent() {
  const [range, setRange] = useState<OperationsRange>("24h");
  const [version, setVersion] = useState(0);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  // `version` forces a refetch after checks run or incidents change.
  const fetcher = useCallback(() => fetchOperationsOverview(range), [range, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data, loading, error, retry } = useAdminQuery(fetcher);
  const refresh = () => setVersion((value) => value + 1);

  const runChecks = async () => {
    setChecking(true);
    try {
      await runOperationsChecks();
      toast.success("Checks completed");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't run checks");
    } finally {
      setChecking(false);
    }
  };

  const allTargets = useMemo(() => (data ? [...data.services, ...data.providers, ...data.queues] : []), [data]);
  const servicesUp = data?.services.filter((service) => service.status !== "down").length ?? 0;
  const uptimes = data?.services.map((service) => service.uptimePct).filter((value): value is number => value !== null) ?? [];
  const averageUptime = uptimes.length ? Math.round((uptimes.reduce((sum, value) => sum + value, 0) / uptimes.length) * 100) / 100 : null;
  const backlog = data?.queues.reduce((sum, queue) => sum + (queue.messages ?? 0), 0) ?? 0;
  const problems = allTargets.filter((target) => target.status === "down" || target.status === "degraded");
  const rangeLabel = OPERATIONS_RANGES.find((r) => r.value === range)?.label.toLowerCase() ?? "";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operational health"
        description="Automated checks of every service, external provider and message queue, with uptime history and incidents."
        meta={data ? <span className="text-xs text-muted-foreground">Last checked {formatRelative(data.lastCheckedAt)} · every {data.intervalSeconds}s</span> : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={(value) => setRange(value as OperationsRange)}>
              <SelectTrigger className="h-8 w-[150px] bg-background text-xs" aria-label="Time range"><SelectValue /></SelectTrigger>
              <SelectContent>{OPERATIONS_RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}><RotateCwIcon className="mr-1.5 size-3.5" />Refresh</Button>
            <PermissionButton permission="system.manage" variant="outline" size="sm" onClick={runChecks} disabled={checking}>
              <PlayIcon className="mr-1.5 size-3.5" />{checking ? "Checking…" : "Run checks now"}
            </PermissionButton>
            <PermissionButton permission="system.manage" size="sm" onClick={() => setCreating(true)} disabled={!data}>
              <PlusIcon className="mr-1.5 size-3.5" />Report incident
            </PermissionButton>
          </div>
        }
      />

      {loading ? <LoadingState label="Loading operational health" className="rounded-lg border" /> : error ? <ErrorState title="Couldn't load operational health" description={error} onRetry={retry} /> : data && (
        <>
          {!data.historyAvailable && (
            <Alert>
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>History unavailable</AlertTitle>
              <AlertDescription>The database is unreachable, so only the latest live check is shown. Uptime, latency history and incidents return once it reconnects.</AlertDescription>
            </Alert>
          )}
          {!data.monitorEnabled && (
            <Alert>
              <ActivityIcon className="size-4" />
              <AlertTitle>Scheduled checks are off</AlertTitle>
              <AlertDescription>OPS_MONITOR_ENABLED is false on admin-service. Results only update when someone runs checks manually.</AlertDescription>
            </Alert>
          )}
          {problems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>{problems.length} component{problems.length === 1 ? " needs" : "s need"} attention</AlertTitle>
              <AlertDescription>{problems.map((target) => `${target.name} (${STATUS_LABEL[target.status].label.toLowerCase()})`).join(", ")}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Services up" kind="current" value={`${servicesUp} / ${data.services.length}`} footnote="Latest check" />
            <MetricCard label="Average service uptime" kind="period" value={percent(averageUptime)} footnote={rangeLabel} />
            <MetricCard label="Open incidents" kind="current" value={formatNumber(data.incidents.open)} footnote="Not yet resolved" />
            <MetricCard label="Queued messages" kind="current" value={formatNumber(backlog)} footnote={`Across ${data.queues.length} queue${data.queues.length === 1 ? "" : "s"}`} />
          </div>

          <ServicesSection overview={data} />
          <LatencySection overview={data} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ProvidersSection overview={data} />
            <QueuesSection overview={data} />
          </div>
          <IncidentsSection targets={allTargets} version={version} onChanged={refresh} />
          <CreateIncidentDialog open={creating} targets={allTargets} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />
        </>
      )}

      <AdminServiceDependencies />
    </div>
  );
}

export default function OperationalHealthPage() {
  return <PermissionGuard permission="dashboard.view"><HealthContent /></PermissionGuard>;
}
