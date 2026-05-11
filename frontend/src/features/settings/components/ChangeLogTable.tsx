import { useState } from 'react';
import { useChangelog } from '../hooks/useSystemConfig';
import { Badge } from '@/components/ui/badge';

const SECTIONS = ['RecommendationPolicy', 'SlaPolicy', 'ExpensePolicy', 'NotificationPolicy', 'RequestPolicy'];

export function ChangeLogTable() {
  const [section, setSection] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useChangelog({ section, page, pageSize });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={section ?? ''}
          onChange={(e) => { setSection(e.target.value || undefined); setPage(1); }}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)]"
        >
          <option value="">All sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Changed At</th>
                  <th className="px-4 py-3 text-left font-medium">Section</th>
                  <th className="px-4 py-3 text-left font-medium">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.changedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{log.section}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.changedByUserId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {data.page} of {data.totalPages} ({data.totalCount} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-40">
                Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data.totalPages ?? 1)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}