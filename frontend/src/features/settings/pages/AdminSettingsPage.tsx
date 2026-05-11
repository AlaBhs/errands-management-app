import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { RecommendationPolicyForm } from '../components/RecommendationPolicyForm';
import { SlaPolicyForm } from '../components/SlaPolicyForm';
import { ExpensePolicyForm } from '../components/ExpensePolicyForm';
import { NotificationPolicyForm } from '../components/NotificationPolicyForm';
import { RequestPolicyForm } from '../components/RequestPolicyForm';
import { ChangeLogTable } from '../components/ChangeLogTable';

type Tab = 'recommendation' | 'sla' | 'expense' | 'notifications' | 'requests' | 'changelog';

const TABS: { id: Tab; label: string }[] = [
  { id: 'recommendation', label: 'Recommendation Engine' },
  { id: 'sla',            label: 'SLA & Deadlines' },
  { id: 'expense',        label: 'Expense Policy' },
  { id: 'notifications',  label: 'Notification Policy' },
  { id: 'requests',       label: 'Request Rules' },
  { id: 'changelog',      label: 'Change History' },
];

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('recommendation');
  const { data: config, isLoading } = useSystemConfig();

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading configuration…</div>;
  }
  if (!config) {
    return <div className="p-8 text-sm text-red-500">Failed to load system configuration.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        subtitle="Manage all operational parameters. Changes take effect immediately and are logged."
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-[var(--ey-dark)] text-foreground bg-muted/30'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
        {activeTab === 'recommendation' && <RecommendationPolicyForm initialData={config.recommendationPolicy} />}
        {activeTab === 'sla'            && <SlaPolicyForm            initialData={config.slaPolicy} />}
        {activeTab === 'expense'        && <ExpensePolicyForm        initialData={config.expensePolicy} />}
        {activeTab === 'notifications'  && <NotificationPolicyForm   initialData={config.notificationPolicy} />}
        {activeTab === 'requests'       && <RequestPolicyForm        initialData={config.requestPolicy} />}
        {activeTab === 'changelog'      && <ChangeLogTable />}
      </div>
    </div>
  );
}