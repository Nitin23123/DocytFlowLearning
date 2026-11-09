import React from 'react';
import type { DashboardStats } from '../types';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  if (!stats) return null;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const cards = [
    {
      label: 'Total Payables',
      value: formatCurrency(stats.totalAccountsPayable),
      meta: `${stats.totalInvoices} total bills recorded`,
      filter: 'ALL',
    },
    {
      label: 'Requires Approval',
      value: formatCurrency(stats.pendingReviewAmount),
      meta: `${stats.pendingReviewCount + stats.lowConfidenceCount} bills to approve`,
      filter: 'PENDING',
      highlight: stats.pendingReviewCount > 0,
    },
    {
      label: 'Synced to Ledger',
      value: formatCurrency(stats.syncedAmount),
      meta: `${stats.syncedCount} posted with balanced JEs`,
      filter: 'SYNCED',
    },
    {
      label: 'Duplicate Alerts',
      value: `${stats.duplicateFlaggedCount}`,
      meta: stats.duplicateFlaggedCount > 0 ? 'Review before payment' : 'No duplicates detected',
      filter: 'DUPLICATE',
      isWarning: stats.duplicateFlaggedCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((c) => {
        const isActive = activeFilter === c.filter;

        return (
          <div
            key={c.label}
            onClick={() => onFilterChange(c.filter)}
            className={`p-3.5 rounded-lg border bg-zinc-900/30 hover:bg-zinc-900/60 transition cursor-pointer ${
              isActive
                ? 'border-zinc-500 bg-zinc-900/90 shadow-xs'
                : 'border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-medium">
              <span>{c.label}</span>
              {c.isWarning && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <div className={`text-xl font-semibold tracking-tight font-mono ${
              c.isWarning ? 'text-rose-400' : 'text-zinc-100'
            }`}>
              {c.value}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{c.meta}</div>
          </div>
        );
      })}
    </div>
  );
};
