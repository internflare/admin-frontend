import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ADMIN_NAV } from "@/polymet/data/admin-nav";
import { useAdminRole } from "@/polymet/components/admin-role-provider";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InternflareLogo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#591e00] text-white">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path d="M12 2c1.5 3.2 5 5.2 5 9.5A5 5 0 0 1 12 16.5a5 5 0 0 1-5-5C7 8.4 9.2 6.6 10 4c.9 1.6 1.5 2.6 2 4 .6-2 .4-4 0-6Z" fill="#fd7128" />
          <rect x="7" y="18.5" width="10" height="2.5" rx="1.25" fill="#fff" />
        </svg>
      </span>
      {!compact && (
        <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-semibold">Internflare Admin</span>
          <span className="truncate text-[11px] text-muted-foreground">Ecosystem control centre</span>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { can, role } = useAdminRole();
  const { isMobile, setOpenMobile } = useSidebar();
  // On mobile the sidebar is a sheet — close it once a link is followed.
  const closeOnNavigate = (e: ReactMouseEvent) => {
    if (isMobile && (e.target as HTMLElement).closest("a")) setOpenMobile(false);
  };

  // Most-specific match wins so "/listings/moderation" doesn't also highlight "/listings".
  const allHrefs = ADMIN_NAV.flatMap((s) => s.items.filter((i) => can(i.permission) || (i.alternativePermission && can(i.alternativePermission))).map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) => isActive(pathname, href))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3" onClickCapture={closeOnNavigate}>
        <Link to="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <InternflareLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-1" onClickCapture={closeOnNavigate}>
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((item) => can(item.permission) || (item.alternativePermission && can(item.alternativePermission)));
          if (items.length === 0) return null;
          return (
            <Collapsible key={section.title} defaultOpen className="group/collapsible">
              <SidebarGroup className="py-1">
                <SidebarGroupLabel asChild className="text-[11px] uppercase tracking-wide">
                  <CollapsibleTrigger className="flex w-full items-center">
                    {section.title}
                    <ChevronDownIcon className="ml-auto size-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => {
                        const active = item.href === activeHref;
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              tooltip={item.title}
                              className="relative h-8 data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:h-5 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary"
                            >
                              <Link to={item.href}>
                                <item.icon className={active ? "text-primary" : undefined} />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-md bg-sidebar-accent/60 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Signed in as</p>
          <p className="truncate text-xs font-medium">{role.label}</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
