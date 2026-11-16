import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResourcePage } from "@/polymet/components/resource-page";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { CreateDisputeDialog, DisputeDetailDialog } from "@/polymet/components/dispute-workflow";
import { disputesResource } from "@/polymet/lib/dispute-service";
import { recordId } from "@/polymet/lib/admin-service";

export default function DisputesPage() {
  return <PermissionGuard permission="support.view"><DisputesContent /></PermissionGuard>;
}
function DisputesContent() {
  const [creating, setCreating] = useState(false);
  const [revision, setRevision] = useState(0);
  const [params, setParams] = useSearchParams();
  const selected = params.get("case");
  const select = (id: string | null) => setParams((previous) => {
    const next = new URLSearchParams(previous);
    if (id) next.set("case", id); else next.delete("case");
    return next;
  });
  return <>
    <ResourcePage key={revision} resource={disputesResource}
      actions={<PermissionButton permission="disputes.manage" onClick={() => setCreating(true)}>Create dispute</PermissionButton>}
      rowActions={(record) => <Button variant="outline" size="sm" onClick={() => select(recordId(record))}>Open case</Button>} />
    {creating && <CreateDisputeDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setRevision((value) => value + 1); select(id); }} />}
    {selected && <DisputeDetailDialog key={selected} id={selected} onClose={() => select(null)} onChanged={() => setRevision((value) => value + 1)} />}
  </>;
}
