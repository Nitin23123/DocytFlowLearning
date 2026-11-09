import React from 'react';
import type { InvoiceDocument } from '../types';
import { Search, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface QueueListProps {
  invoices: InvoiceDocument[];
  selectedId: number | null;
  onSelect: (invoice: InvoiceDocument) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const QueueList: React.FC<QueueListProps> = ({
  invoices,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  // Counts for the 3 clear workflow stages
  const pendingCount = invoices.filter((i) => !i.isSynced && !i.isDuplicateFlagged).length;
  const alertCount = invoices.filter((i) => i.isDuplicateFlagged).length;
  const syncedCount = invoices.filter((i) => i.isSynced).length;

  const tabs = [
    { label: 'All Bills', key: 'ALL', count: invoices.length },
    { label: '1. Review Queue', key: 'PENDING', count: pendingCount },
    { label: '2. Alerts', key: 'DUPLICATE', count: alertCount, hasAlert: alertCount > 0 },
    { label: '3. Synced', key: 'SYNCED', count: syncedCount },
  ];

  const filtered = invoices.filter((inv) => {
    if (activeFilter === 'PENDING' && (inv.isSynced || inv.isDuplicateFlagged)) return false;
    if (activeFilter === 'SYNCED' && !inv.isSynced) return false;
    if (activeFilter === 'DUPLICATE' && !inv.isDuplicateFlagged) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.vendorName?.toLowerCase().includes(q) ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.glAccountName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
      
      {/* Workflow Tabs */}
      <div className="p-3 border-b border-zinc-800 space-y-2 shrink-0 bg-zinc-950/60">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor, bill #, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* 3 Workflow Stages */}
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={`py-1.5 px-1 text-center rounded text-[11px] font-medium transition flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  tab.hasAlert && !isActive
                    ? 'bg-rose-500/20 text-rose-400 font-bold'
                    : isActive
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'bg-zinc-850 text-zinc-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No bills in this stage.
          </div>
        ) : (
          filtered.map((inv) => {
            const isSelected = inv.id === selectedId;

            return (
              <div
                key={inv.id}
                onClick={() => onSelect(inv)}
                className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-zinc-800/90 border-l-2 border-white'
                    : 'hover:bg-zinc-850/40'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {inv.isDuplicateFlagged ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : inv.isSynced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  )}

                  <div className="min-w-0">
                    <div className="font-medium text-xs text-zinc-100 truncate">
                      {inv.vendorName}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                      #{inv.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-1">
                      {inv.glAccountCode} {inv.glAccountName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-medium text-xs text-zinc-100">
                    ${inv.totalAmount?.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {inv.dueDate ? `Due ${inv.dueDate.slice(5)}` : 'Immediate'}
                  </div>

                  {inv.isDuplicateFlagged ? (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 font-medium">
                      Duplicate Alert
                    </span>
                  ) : inv.isSynced ? (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                      Synced to QBO
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium">
                      Needs Review
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/60 text-[11px] text-zinc-500 flex justify-between items-center shrink-0">
        <span>Showing {filtered.length} bills</span>
        <span>Select to review</span>
      </div>

    </div>
  );
};
