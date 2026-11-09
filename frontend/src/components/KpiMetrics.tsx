import React from 'react';
import type { DashboardStats } from '../types';
import { DollarSign, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface KpiMetricsProps {
  stats: DashboardStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ stats, activeFilter, onFilterChange }) => {
  if (!stats) return null;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const metrics = [
    {
      title: 'Total Invoices',
      value: formatCurrency(stats.totalAccountsPayable),
      count: `${stats.totalInvoices} bills`,
      icon: DollarSign,
      filter: 'ALL',
      activeColor: 'border-slate-600',
    },
    {
      title: 'Needs Review',
      value: `${stats.pendingReviewCount + stats.lowConfidenceCount}`,
      count: `${formatCurrency(stats.pendingReviewAmount)} pending approval`,
      icon: Clock,
      badge: stats.lowConfidenceCount > 0 ? `${stats.lowConfidenceCount} low confidence` : undefined,
      filter: 'PENDING_REVIEW',
      activeColor: 'border-amber-500/50',
      badgeColor: 'bg-amber-500/10 text-amber-400',
    },
    {
      title: 'Synced to QuickBooks',
      value: `${stats.syncedCount}`,
      count: `${formatCurrency(stats.syncedAmount)} posted with balanced entries`,
      icon: CheckCircle2,
      badge: 'Balanced JEs',
      filter: 'SYNCED_TO_LEDGER',
      activeColor: 'border-emerald-500/50',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        const isActive = activeFilter === m.filter;

        return (
          <div
            key={m.title}
            onClick={() => onFilterChange(m.filter)}
            className={`p-4 rounded-xl border bg-slate-900/60 transition cursor-pointer hover:bg-slate-850 ${
              isActive ? `${m.activeColor} bg-slate-800/80 shadow-sm` : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">{m.title}</span>
              {m.badge && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${m.badgeColor}`}>
                  {m.badge}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{m.value}</div>
            <div className="text-xs text-slate-500">{m.count}</div>
          </div>
        );
      })}
    </div>
  );
};
