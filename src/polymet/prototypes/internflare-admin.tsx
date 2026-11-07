import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdminRoleProvider } from "@/polymet/components/admin-role-provider";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import { AdminAuthProvider, useAdminAuth } from "@/polymet/components/admin-auth-provider";
import LoginPage from "@/polymet/pages/login";
import { EmptyState, SessionLoading } from "@/polymet/components/state-views";
import ExecutiveDashboardPage from "@/polymet/pages/executive-dashboard";
import OperationalHealthPage from "@/polymet/pages/operational-health";
import ActionQueuePage from "@/polymet/pages/action-queue";
import UserDirectoryPage from "@/polymet/pages/user-directory";
import UserDetailPage from "@/polymet/pages/user-detail";
import AccountAccessPage from "@/polymet/pages/account-access";
import CompanyDirectoryPage from "@/polymet/pages/company-directory";
import CompanyDetailPage from "@/polymet/pages/company-detail";
import VerificationQueuePage from "@/polymet/pages/verification-queue";
import VerificationReviewPage from "@/polymet/pages/verification-review";
import SupervisorsPage from "@/polymet/pages/supervisors";
import MentorsPage from "@/polymet/pages/mentors";
import ListingsPage from "@/polymet/pages/listings";
import ListingDetailPage from "@/polymet/pages/listing-detail";
import ApplicationsPage from "@/polymet/pages/applications";
import PlacementsPage from "@/polymet/pages/placements";
import TalentOversightPage from "@/polymet/pages/talent-oversight";
import WorkspacesPage from "@/polymet/pages/workspaces";
import WorkspaceDetailPage from "@/polymet/pages/workspace-detail";
import WorkspaceActivityPage from "@/polymet/pages/workspace-activity";
import PlansPage from "@/polymet/pages/plans";
import SubscriptionsPage from "@/polymet/pages/subscriptions";
import SubscriptionDetailPage from "@/polymet/pages/subscription-detail";
import TransactionsPage from "@/polymet/pages/transactions";
import ReconciliationPage from "@/polymet/pages/reconciliation";
import ExternalSourcesPage from "@/polymet/pages/external-sources";
import SourceDetailPage from "@/polymet/pages/source-detail";
import SyncMonitoringPage from "@/polymet/pages/sync-monitoring";
import AIUsagePage from "@/polymet/pages/ai-usage";
import NotificationsPage from "@/polymet/pages/notifications";
import SupportPage from "@/polymet/pages/support";
import SupportTicketDetailPage from "@/polymet/pages/support-ticket-detail";
import FeedbackPage from "@/polymet/pages/feedback";
import FeedbackDetailPage from "@/polymet/pages/feedback-detail";
import DisputesPage from "@/polymet/pages/disputes";
import AuditLogsPage from "@/polymet/pages/audit-logs";
import AnalyticsPage from "@/polymet/pages/analytics";
import SettingsPage from "@/polymet/pages/settings";

function RequireAdmin() {
  const { admin, isLoadingSession } = useAdminAuth();
  const location = useLocation();

  if (isLoadingSession) {
    return <SessionLoading />;
  }

  if (!admin) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default function InternflareAdminPrototype() {
  return (
    <BrowserRouter>
      <AdminRoleProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAdmin />}>
            {/* Overview */}
            <Route path="/" element={<ExecutiveDashboardPage />} />
            <Route path="/health" element={<OperationalHealthPage />} />
            <Route path="/action-queue" element={<ActionQueuePage />} />

            {/* People & organisations */}
            <Route path="/users" element={<UserDirectoryPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            <Route path="/access" element={<AccountAccessPage />} />
            <Route path="/companies" element={<CompanyDirectoryPage />} />
            <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
            <Route path="/verification" element={<VerificationQueuePage />} />
            <Route path="/verification/:requestId" element={<VerificationReviewPage />} />
            <Route path="/supervisors" element={<SupervisorsPage />} />
            <Route path="/mentors" element={<MentorsPage />} />

            {/* internflareJobs */}
            <Route path="/listings" element={<ListingsPage key="all" />} />
            <Route path="/listings/moderation" element={<ListingsPage key="pending" initialView="pending" />} />
            <Route path="/listings/external" element={<ListingsPage key="external" initialView="external" />} />
            <Route path="/listings/:listingId" element={<ListingDetailPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/placements" element={<PlacementsPage key="jobs" />} />
            <Route path="/talent-oversight/portfolio" element={<TalentOversightPage key="portfolio" initialTab="portfolio" />} />
            <Route path="/talent-oversight/readiness" element={<TalentOversightPage key="readiness" initialTab="readiness" />} />

            {/* SquadCot */}
            <Route path="/workspaces" element={<WorkspacesPage key="directory" />} />
            <Route path="/workspaces/access-issues" element={<WorkspacesPage key="issues" initialTab="issues" />} />
            <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
            <Route path="/engagements" element={<PlacementsPage key="squadcot" context="squadcot" />} />
            <Route path="/workspace-activity/projects" element={<WorkspaceActivityPage key="projects" initialTab="projects" />} />
            <Route path="/workspace-activity/reports" element={<WorkspaceActivityPage key="reports" initialTab="reports" />} />
            <Route path="/workspace-activity/onboarding" element={<WorkspaceActivityPage key="onboarding" initialTab="onboarding" />} />

            {/* Commercial */}
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/subscriptions/:subscriptionId" element={<SubscriptionDetailPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/reconciliation" element={<ReconciliationPage />} />

            {/* Integrations & AI */}
            <Route path="/integrations" element={<ExternalSourcesPage />} />
            <Route path="/integrations/sync" element={<SyncMonitoringPage key="history" initialTab="history" />} />
            <Route path="/integrations/imports" element={<SyncMonitoringPage key="failed" initialTab="failed" />} />
            <Route path="/integrations/:sourceId" element={<SourceDetailPage />} />
            <Route path="/ai-usage" element={<AIUsagePage key="usage" />} />
            <Route path="/ai-usage/matching" element={<AIUsagePage key="matching" initialTab="matching" />} />

            {/* Trust & operations */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/support" element={<SupportPage key="all" />} />
            <Route path="/support/escalations" element={<SupportPage key="escalated" initialView="escalated" />} />
            <Route path="/support/:ticketId" element={<SupportTicketDetailPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/feedback/:feedbackId" element={<FeedbackDetailPage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/analytics" element={<AnalyticsPage key="all" />} />
            <Route path="/analytics/commercial" element={<AnalyticsPage key="commercial" initialTab="commercial" />} />

            {/* System */}
            <Route path="/settings" element={<SettingsPage key="platform" />} />
            <Route path="/settings/admins" element={<SettingsPage key="admins" initialTab="admins" />} />
            <Route path="/settings/features" element={<SettingsPage key="features" initialTab="features" />} />
            <Route path="/settings/security" element={<SettingsPage key="security" initialTab="security" />} />

            <Route
              path="*"
              element={
                <EmptyState
                  title="Page not found"
                  description="This admin route doesn't exist or has moved."
                  action={<Button asChild size="sm" variant="outline" className="bg-background"><Link to="/">Back to dashboard</Link></Button>}
                />
              }
            />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </AdminRoleProvider>
    </BrowserRouter>
  );
}
