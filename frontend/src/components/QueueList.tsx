import React from 'react';
import type { InvoiceDocument } from '../types';
import { Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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
  const tabs = [
    { label: 'All', key: 'ALL' },
    { label: 'Pending', key: 'PENDING' },
    { label: 'Synced', key: 'SYNCED' },
    { label: 'Flagged', key: 'DUPLICATE' },
  ];

  const filtered = invoices.filter((inv) => {
    if (activeFilter === 'PENDING' && inv.isSynced) return false;
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

  const getStatusDot = (inv: InvoiceDocument) => {
    if (inv.isDuplicateFlagged) return 'bg-rose-500';
    if (inv.isSynced) return 'bg-emerald-500';
    if (inv.status === 'APPROVED') return 'bg-blue-500';
    if (inv.overallConfidence < 80) return 'bg-amber-500';
    return 'bg-zinc-500';
  };

  return (
    <div className="flex flex-col h-full border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
      
      {/* Search & Tabs */}
      <div className="p-3 border-b border-zinc-800 space-y-2 shrink-0 bg-zinc-950/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter bills by vendor or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`flex-1 py-1 text-center rounded text-[11px] font-medium transition ${
                activeFilter === tab.key
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No bills in this queue.
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
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getStatusDot(inv)}`} />
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
                  {inv.isDuplicateFlagged && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 font-medium">
                      Duplicate
                    </span>
                  )}
                  {inv.isSynced && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                      Synced
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Queue Summary Footer */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/60 text-[11px] text-zinc-500 flex justify-between items-center shrink-0">
        <span>{filtered.length} bills in view</span>
        <span>Click to review in workstation</span>
      </div>

    </div>
  );
};
