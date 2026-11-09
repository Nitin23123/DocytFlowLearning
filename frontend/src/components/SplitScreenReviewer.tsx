import React, { useState, useEffect } from 'react';
import type { InvoiceDocument, ChartOfAccount, AuditLog } from '../types';
import { api } from '../services/api';
import { X, Check, AlertTriangle, Sparkles, CheckCircle2, History, ArrowRight } from 'lucide-react';

interface SplitScreenReviewerProps {
  invoice: InvoiceDocument;
  accounts: ChartOfAccount[];
  onClose: () => void;
  onInvoiceUpdated: (updated: InvoiceDocument) => void;
  onSynced: (je: any) => void;
}

export const SplitScreenReviewer: React.FC<SplitScreenReviewerProps> = ({
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
  const [showAudit, setShowAudit] = useState(false);
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
      }).then((updated) => {
        onInvoiceUpdated(updated);
      });
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Simple Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="font-bold text-white text-base">{vendorName}</div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              #{invoice.invoiceNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split: Document on Left, Simple Review on Right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          {/* Left: Clean Invoice Document Preview */}
          <div className="md:w-1/2 p-6 bg-slate-950/40 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Document Source
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="font-bold text-white text-lg">{vendorName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{invoice.entityLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-mono">Invoice</div>
                    <div className="text-xs font-mono font-semibold text-white">#{invoice.invoiceNumber}</div>
                    <div className="text-xs text-slate-400 mt-1">Due: {invoice.dueDate || 'Immediate'}</div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2 py-2">
                  {invoice.lineItems && invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1">
                        <span className="text-slate-300">{item.description}</span>
                        <span className="font-mono font-semibold text-white">${item.amount?.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-slate-300">Invoice total amount</span>
                      <span className="font-mono font-semibold text-white">${totalAmount?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Total Due</span>
                  <span className="text-white font-mono text-base">${totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 mt-4 flex items-center justify-between">
              <span>OCR Source: PDF parsed</span>
              <span className="font-mono">ID: {invoice.id}</span>
            </div>
          </div>

          {/* Right: Simple Review Form */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Status Banner */}
              {invoice.isDuplicateFlagged ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-rose-300">Duplicate Bill Warning</div>
                    <div className="text-[11px] text-rose-400 mt-0.5">
                      {invoice.duplicateReason || 'A bill with this number already exists.'}
                    </div>
                  </div>
                </div>
              ) : invoice.isSynced ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs font-semibold text-emerald-300">
                    Synced to QuickBooks ({invoice.syncTransactionId})
                  </div>
                </div>
              ) : invoice.overallConfidence < 80 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-xs font-semibold text-amber-300">
                    Low Confidence OCR ({invoice.overallConfidence}%) — Please verify details
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs font-semibold text-emerald-300">
                    AI Verified • {invoice.overallConfidence}% Confidence
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Chart of Accounts (GL Category)</label>
                  <select
                    value={glAccountCode}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Auto-categorized by Docyt ML engine
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Collapsible Audit History */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAudit(!showAudit)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{showAudit ? 'Hide Audit Trail' : `Show Audit Trail (${auditLogs.length})`}</span>
                </button>

                {showAudit && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto space-y-1.5 text-[11px]">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="text-slate-400">
                        <span className="text-emerald-400 font-mono font-semibold">{log.action}: </span>
                        <span>{log.details}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Big Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Close
              </button>

              {invoice.isSynced ? (
                <div className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Posted to General Ledger</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApproveAndSync}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isSyncing ? 'Syncing...' : 'Approve & Sync to QuickBooks'}</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
