import React from 'react';
import type { DashboardStats } from '../types';

interface MetricsRowProps {
  stats: DashboardStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ stats, activeFilter, onFilterChange }) => {
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
      title: 'Total Payables',
      value: formatCurrency(stats.totalAccountsPayable),
      meta: `${stats.totalInvoices} total invoices`,
      filter: 'ALL',
    },
    {
      title: 'Pending Review',
      value: formatCurrency(stats.pendingReviewAmount),
      meta: `${stats.pendingReviewCount + stats.lowConfidenceCount} invoices to approve`,
      filter: 'PENDING_REVIEW',
      alert: stats.duplicateFlaggedCount > 0 ? `${stats.duplicateFlaggedCount} flagged` : undefined,
    },
    {
      title: 'Synced to Ledger',
      value: formatCurrency(stats.syncedAmount),
      meta: `${stats.syncedCount} posted to QuickBooks`,
      filter: 'SYNCED_TO_LEDGER',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((c) => {
        const isActive = activeFilter === c.filter;
        return (
          <div
            key={c.title}
            onClick={() => onFilterChange(c.filter)}
            className={`p-4 rounded-xl border bg-zinc-900/40 hover:bg-zinc-900/80 transition cursor-pointer ${
              isActive ? 'border-zinc-500 bg-zinc-900' : 'border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
              <span>{c.title}</span>
              {c.alert && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {c.alert}
                </span>
              )}
            </div>
            <div className="text-2xl font-semibold text-zinc-100 tracking-tight mb-1">
              {c.value}
            </div>
            <div className="text-xs text-zinc-500">{c.meta}</div>
          </div>
        );
      })}
    </div>
  );
};
