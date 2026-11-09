import React, { useState, useEffect } from 'react';
import type { InvoiceDocument, ChartOfAccount, AuditLog } from '../types';
import { api } from '../services/api';
import { X, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InvoiceDrawerProps {
  invoice: InvoiceDocument;
  accounts: ChartOfAccount[];
  onClose: () => void;
  onInvoiceUpdated: (updated: InvoiceDocument) => void;
  onSynced: (je: any) => void;
}

export const InvoiceDrawer: React.FC<InvoiceDrawerProps> = ({
  invoice,
  accounts,
  onClose,
  onInvoiceUpdated,
  onSynced,
}) => {
  const [vendorName, setVendorName] = useState(invoice.vendorName);
  const [totalAmount, setTotalAmount] = useState(invoice.totalAmount);
  const [glAccountCode, setGlAccountCode] = useState(invoice.glAccountCode);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    api.getAuditLogs(invoice.id).then(setAuditLogs).catch(console.error);
  }, [invoice.id]);

  const handleAccountChange = (code: string) => {
    const acc = accounts.find((a) => a.code === code);
    if (acc) {
      setGlAccountCode(code);
      api.updateInvoice(invoice.id, {
        glAccountCode: acc.code,
        glAccountName: acc.name,
      }).then(onInvoiceUpdated);
    }
  };

  const handleApproveAndSync = async () => {
    setIsSyncing(true);
    try {
      if (invoice.status !== 'APPROVED') {
        await api.approveInvoice(invoice.id);
      }
      const je = await api.syncToLedger(invoice.id);
      const updated = await api.getInvoice(invoice.id);
      onInvoiceUpdated(updated);
      onSynced(je);
    } catch (err) {
      alert('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-zinc-100">{vendorName}</div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">Invoice #{invoice.invoiceNumber}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Anomaly / Duplicate Warning */}
          {invoice.isDuplicateFlagged && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-300">Potential Duplicate</div>
                <div className="text-zinc-400 mt-0.5 leading-relaxed">
                  {invoice.duplicateReason || 'A bill with this vendor and invoice number already exists.'}
                </div>
              </div>
            </div>
          )}

          {/* Core Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Vendor</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Account Category (General Ledger)</label>
              <select
                value={glAccountCode}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                {accounts.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} — {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Due Date</label>
                <input
                  type="text"
                  disabled
                  value={invoice.dueDate || 'Immediate'}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="font-semibold text-zinc-400 mb-2">Line Items</div>
            <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800/60 overflow-hidden bg-zinc-900/30">
              {invoice.lineItems && invoice.lineItems.length > 0 ? (
                invoice.lineItems.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <span className="text-zinc-300">{item.description}</span>
                    <span className="font-mono text-zinc-200 font-medium">${item.amount?.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 flex justify-between items-center text-zinc-400">
                  <span>General invoice amount</span>
                  <span className="font-mono text-zinc-200 font-medium">${totalAmount?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit History */}
          <div>
            <div className="font-semibold text-zinc-400 mb-2">Audit History</div>
            <div className="border border-zinc-800 rounded-lg p-3 space-y-2 bg-zinc-900/30 max-h-40 overflow-y-auto text-[11px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-zinc-400">
                  <span className="text-zinc-200 font-medium">{log.action}: </span>
                  <span>{log.details}</span>
                  <div className="text-[10px] text-zinc-600 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()} • {log.performedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>

          {invoice.isSynced ? (
            <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synced ({invoice.syncTransactionId})</span>
            </div>
          ) : (
            <button
              onClick={handleApproveAndSync}
              disabled={isSyncing}
              className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg transition active:scale-95"
            >
              {isSyncing ? 'Posting...' : 'Approve & Sync to QuickBooks'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
