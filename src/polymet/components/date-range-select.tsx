import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "qtd", label: "Quarter to date" },
  { value: "ytd", label: "Year to date" },
  { value: "12m", label: "Last 12 months" },
];

interface DateRangeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  showCompare?: boolean;
}

export function DateRangeSelect({ value, onChange, showCompare = true }: DateRangeSelectProps) {
  const [internal, setInternal] = useState(value ?? "30d");
  const [compare, setCompare] = useState(true);
  const current = value ?? internal;
  return (
    <div className="flex items-center gap-3">
      <Select
        value={current}
        onValueChange={(v) => {
          setInternal(v);
          onChange?.(v);
        }}
      >
        <SelectTrigger className="h-8 w-[170px] bg-background text-xs" aria-label="Date range">
          <CalendarIcon className="mr-1 size-3.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showCompare && (
        <div className="hidden items-center gap-2 sm:flex">
          <Switch id="compare-period" checked={compare} onCheckedChange={setCompare} />
          <Label htmlFor="compare-period" className="text-xs font-normal text-muted-foreground">
            Compare to previous
          </Label>
        </div>
      )}
    </div>
  );
}
