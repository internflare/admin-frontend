import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { StatusBadge } from "@/polymet/components/status-badge";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import type { Permission } from "@/polymet/data/admin-roles";
import { USERS, COMPANIES } from "@/polymet/data/people-data";
import { LISTINGS, APPLICATIONS, PLACEMENTS } from "@/polymet/data/jobs-data";
import { WORKSPACES } from "@/polymet/data/squadcot-data";
import { SUBSCRIPTIONS, TRANSACTIONS } from "@/polymet/data/commercial-data";
import { TICKETS, AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { ADMIN_NAV } from "@/polymet/data/admin-nav";

interface SearchGroup {
  heading: string;
  permission: Permission;
  items: { id: string; title: string; subtitle: string; status: string; href: string }[];
}

const GROUPS: SearchGroup[] = [
  { heading: "Users & talent", permission: "users.view", items: USERS.map((u) => ({ id: u.id, title: u.name, subtitle: `${u.id} · ${u.accountType}`, status: u.status, href: `/users/${u.id}` })) },
  { heading: "Companies", permission: "companies.view", items: COMPANIES.map((c) => ({ id: c.id, title: c.name, subtitle: `${c.id} · ${c.industry}`, status: c.verification, href: `/companies/${c.id}` })) },
  { heading: "Listings", permission: "listings.view", items: LISTINGS.map((l) => ({ id: l.id, title: l.title, subtitle: `${l.id} · ${l.company}`, status: l.status, href: `/listings/${l.id}` })) },
  { heading: "Applications", permission: "recruitment.view", items: APPLICATIONS.map((a) => ({ id: a.id, title: `${a.candidate} → ${a.listing}`, subtitle: a.id, status: a.stage, href: `/applications?ref=${a.id}` })) },
  { heading: "Engagements", permission: "recruitment.view", items: PLACEMENTS.map((p) => ({ id: p.id, title: `${p.candidate} · ${p.employer}`, subtitle: p.id, status: p.status, href: `/placements?ref=${p.id}` })) },
  { heading: "Workspaces", permission: "workspaces.view", items: WORKSPACES.map((w) => ({ id: w.id, title: w.company, subtitle: w.id, status: w.health, href: `/workspaces/${w.id}` })) },
  { heading: "Subscriptions", permission: "finance.view", items: SUBSCRIPTIONS.map((s) => ({ id: s.id, title: `${s.account} · ${s.plan}`, subtitle: s.id, status: s.status, href: `/subscriptions/${s.id}` })) },
  { heading: "Transactions", permission: "finance.view", items: TRANSACTIONS.map((t) => ({ id: t.id, title: `${t.category} · ${t.payer}`, subtitle: `${t.id} · ${t.providerRef}`, status: t.status, href: `/transactions?ref=${t.id}` })) },
  { heading: "Support tickets", permission: "support.view", items: TICKETS.map((t) => ({ id: t.id, title: t.subject, subtitle: `${t.id} · ${t.requester}`, status: t.status, href: `/support/${t.id}` })) },
  { heading: "Audit events", permission: "audit.view", items: AUDIT_EVENTS.map((a) => ({ id: a.id, title: a.action, subtitle: `${a.id} · ${a.entity}`, status: a.outcome, href: `/audit-logs?ref=${a.id}` })) },
];

export function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { can } = useAdminRole();

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search users, companies, listings, transactions, tickets, audit IDs…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No authorised records match.</CommandEmpty>
        <CommandGroup heading="Go to module">
          {ADMIN_NAV.flatMap((s) => s.items)
            .filter((i) => can(i.permission))
            .map((item) => (
              <CommandItem key={item.href} value={`module ${item.title}`} onSelect={() => go(item.href)}>
                <item.icon className="mr-2 size-4 text-muted-foreground" />
                {item.title}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandSeparator />
        {GROUPS.filter((g) => can(g.permission)).map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem key={item.id} value={`${item.title} ${item.subtitle}`} onSelect={() => go(item.href)} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.title}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{item.subtitle}</p>
                </div>
                <StatusBadge status={item.status} />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
        Results are limited to records your role is authorised to view.
      </div>
    </CommandDialog>
  );
}
