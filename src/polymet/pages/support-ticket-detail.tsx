import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function SupportTicketDetailPage() {
  return <UnavailablePage title="Support ticket" permission="support.view" description="The admin API does not implement ticket details, messages, attachments, assignment or status changes." />;
}
