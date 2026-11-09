import React from 'react';
import type { InvoiceDocument } from '../types';
import { ArrowUpRight, Search } from 'lucide-react';

interface InvoiceTableProps {
  invoices: InvoiceDocument[];
  onSelectInvoice: (invoice: InvoiceDocument) => void;
  onViewJournalEntry: (id: number) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onSelectInvoice,
  onViewJournalEntry,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const getStatusBadge = (inv: InvoiceDocument) => {
    if (inv.isDuplicateFlagged) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Flagged Duplicate
        </span>
      );
    }
    if (inv.isSynced) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Synced
        </span>
      );
    }
    if (inv.status === 'APPROVED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Approved
        </span>
      );
    }
    if (inv.overallConfidence < 80) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Needs Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
        Pending
      </span>
    );
  };

  const tabs = [
    { label: 'All Invoices', key: 'ALL' },
    { label: 'Pending Review', key: 'PENDING_REVIEW' },
    { label: 'Synced', key: 'SYNCED_TO_LEDGER' },
  ];

  const filtered = invoices.filter((inv) => {
    if (activeFilter === 'PENDING_REVIEW' && inv.isSynced) return false;
    if (activeFilter === 'SYNCED_TO_LEDGER' && !inv.isSynced) return false;

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
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
      
      {/* Search & Tabs */}
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-1 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === tab.key
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="py-3 px-4">Vendor</th>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Account Category</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="hover:bg-zinc-850/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 font-medium text-zinc-100 group-hover:text-white">
                    {inv.vendorName}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    <span className="font-mono text-zinc-500 mr-1.5">{inv.glAccountCode}</span>
                    {inv.glAccountName}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 font-mono">
                    {inv.dueDate || 'Immediate'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium font-mono text-zinc-100">
                    ${inv.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(inv)}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {inv.isSynced ? (
                      <button
                        onClick={() => onViewJournalEntry(inv.id)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
                      >
                        <span>Journal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="text-xs text-zinc-400 hover:text-zinc-100 transition"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
