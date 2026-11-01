import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BellIcon, LogOutIcon, MoonIcon, SearchIcon, ShieldCheckIcon, SunIcon, KeyRoundIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { useAdminAuth } from "@/polymet/components/admin-auth-provider";
import { PriorityBadge } from "@/polymet/components/status-badge";
import { ADMIN_ROLES, type AdminRoleId } from "@/polymet/data/admin-roles";
import { ACTION_QUEUE } from "@/polymet/data/operations-data";
import { GlobalSearchDialog } from "@/polymet/layouts/global-search-dialog";
import { formatRelative } from "@/polymet/lib/format";

export function AdminTopbar() {
  const { role, setRoleId } = useAdminRole();
  const { admin, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const initials = (admin?.name ?? "Admin").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const urgent = ACTION_QUEUE.filter((a) => a.status !== "Resolved").slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-md"
        aria-label="Open global search"
      >
        <SearchIcon className="size-3.5" />
        <span className="flex-1 truncate"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search records, IDs, references…</span></span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8" aria-label={`Alerts (${urgent.length})`}>
              <BellIcon className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-80 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <p className="text-sm font-semibold">Needs attention</p>
              <Link to="/action-queue" className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-400">View queue</Link>
            </div>
            <ul className="divide-y">
              {urgent.map((a) => (
                <li key={a.id}>
                  <Link to={a.href} className="flex flex-col gap-1 px-3 py-2.5 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none">
                    <div className="flex items-center justify-between gap-2">
                      <PriorityBadge priority={a.priority} />
                      <span className="text-[11px] text-muted-foreground">{formatRelative(a.createdAt)}</span>
                    </div>
                    <p className="text-xs">{a.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" className="size-8" onClick={toggleTheme} aria-label="Toggle colour theme">
          {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2 rounded-md p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-7 ring-1 ring-border">
                {admin?.avatar && <AvatarImage src={admin.avatar} alt="" />}
                <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight xl:block">
                <p className="text-xs font-medium">{admin?.name}</p>
                <p className="max-w-[160px] truncate text-[11px] text-muted-foreground">{role.label}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-1.5rem)]">
            <DropdownMenuLabel className="space-y-0.5">
              <p className="text-sm">{admin?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{admin?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ShieldCheckIcon className="mr-2 size-4" /> Preview as role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-72 max-w-[calc(100vw-2rem)]">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Demo only — production roles are assigned and enforced by the backend.
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={role.id} onValueChange={(v) => setRoleId(v as AdminRoleId)}>
                  {ADMIN_ROLES.map((r) => (
                    <DropdownMenuRadioItem key={r.id} value={r.id} className="text-xs">
                      {r.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link to="/settings/security">
                <KeyRoundIcon className="mr-2 size-4" /> Session & security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOutIcon className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
