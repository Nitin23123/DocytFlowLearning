import React, { useState, useEffect } from 'react';
import type { InvoiceDocument, ChartOfAccount, AuditLog } from '../types';
import { api } from '../services/api';
import { 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  History,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface DetailWorkstationProps {
  invoice: InvoiceDocument | null;
  accounts: ChartOfAccount[];
  onInvoiceUpdated: (updated: InvoiceDocument) => void;
  onSynced: (je: any) => void;
  onViewJournal: (id: number) => void;
}

export const DetailWorkstation: React.FC<DetailWorkstationProps> = ({
  invoice,
  accounts,
  onInvoiceUpdated,
  onSynced,
  onViewJournal,
}) => {
  if (!invoice) {
    return (
      <div className="h-full border border-zinc-800 rounded-xl bg-zinc-900/20 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <FileText className="w-8 h-8 text-zinc-700 mb-2" />
        <div className="text-xs font-medium text-zinc-400">No bill selected</div>
        <p className="text-[11px] text-zinc-600 mt-1">Select an invoice from the queue on the left to inspect.</p>
      </div>
    );
  }

  const [vendorName, setVendorName] = useState(invoice.vendorName);
  const [totalAmount, setTotalAmount] = useState(invoice.totalAmount);
  const [glAccountCode, setGlAccountCode] = useState(invoice.glAccountCode);
  const [glAccountName, setGlAccountName] = useState(invoice.glAccountName);
  const [entityLocation, setEntityLocation] = useState(invoice.entityLocation);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    setVendorName(invoice.vendorName);
    setTotalAmount(invoice.totalAmount);
    setGlAccountCode(invoice.glAccountCode);
    setGlAccountName(invoice.glAccountName);
    setEntityLocation(invoice.entityLocation);
    api.getAuditLogs(invoice.id).then(setAuditLogs).catch(console.error);
  }, [invoice.id]);

  const handleAccountChange = (code: string) => {
    const acc = accounts.find((a) => a.code === code);
    if (acc) {
      setGlAccountCode(code);
      setGlAccountName(acc.name);
      api.updateInvoice(invoice.id, {
        glAccountCode: acc.code,
        glAccountName: acc.name,
      }).then(onInvoiceUpdated);
    }
  };

  const handlePostToQuickBooks = async () => {
    setIsPosting(true);
    try {
      if (invoice.status !== 'APPROVED') {
        await api.approveInvoice(invoice.id);
      }
      const je = await api.syncToLedger(invoice.id);
      const updated = await api.getInvoice(invoice.id);
      onInvoiceUpdated(updated);
      onSynced(je);
    } catch (err) {
      alert('Ledger sync failed');
    } finally {
      setIsPosting(false);
    }
  };

  // Determine current step in 3-stage workflow
  const currentStep = invoice.isSynced ? 3 : invoice.isDuplicateFlagged ? 2 : 2;

  return (
    <div className="h-full border border-zinc-800 rounded-xl bg-zinc-900/30 flex flex-col overflow-hidden">
      
      {/* 3-Step Visual Workflow Stepper (The Core Explanation Story) */}
      <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6 text-xs w-full max-w-xl">
          
          {/* Step 1: Ingested */}
          <div className="flex items-center gap-2 text-zinc-200 font-medium">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>1. Capture</span>
          </div>
          
          <div className="h-px w-8 bg-zinc-700" />

          {/* Step 2: Code & Verify */}
          <div className={`flex items-center gap-2 font-medium ${
            invoice.isDuplicateFlagged 
              ? 'text-rose-400' 
              : invoice.isSynced 
              ? 'text-zinc-200' 
              : 'text-white'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              invoice.isDuplicateFlagged 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : invoice.isSynced
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white text-zinc-950'
            }`}>
              {invoice.isSynced ? '✓' : '2'}
            </span>
            <span>2. Verify & Code</span>
          </div>

          <div className="h-px w-8 bg-zinc-700" />

          {/* Step 3: Posted */}
          <div className={`flex items-center gap-2 font-medium ${
            invoice.isSynced ? 'text-emerald-400' : 'text-zinc-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              invoice.isSynced 
                ? 'bg-emerald-500 text-zinc-950 font-bold' 
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}>
              {invoice.isSynced ? '✓' : '3'}
            </span>
            <span>3. Posted to QuickBooks</span>
          </div>

        </div>

        {/* Status Pill */}
        <div className="hidden sm:block">
          {invoice.isDuplicateFlagged ? (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Needs Controller Review
            </span>
          ) : invoice.isSynced ? (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Reconciled & Posted
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300">
              Ready for Sign-Off
            </span>
          )}
        </div>
      </div>

      {/* Workstation Top Action Bar */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-100">{vendorName}</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              #{invoice.invoiceNumber}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {entityLocation} • Due {invoice.dueDate || 'Immediate'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.isSynced ? (
            <button
              onClick={() => onViewJournal(invoice.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View Posted Entry ({invoice.syncTransactionId})</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </button>
          ) : invoice.isDuplicateFlagged ? (
            <button
              onClick={handlePostToQuickBooks}
              disabled={isPosting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-md transition"
            >
              <span>{isPosting ? 'Posting...' : 'Override Duplicate & Post'}</span>
            </button>
          ) : (
            <button
              onClick={handlePostToQuickBooks}
              disabled={isPosting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 rounded-md transition active:scale-95 shadow-xs"
            >
              <span>{isPosting ? 'Posting to QuickBooks...' : 'Approve & Post to QuickBooks'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        
        {/* Duplicate Conflict Banner */}
        {invoice.isDuplicateFlagged && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300">Duplicate Bill Detected (Docyt Risk Check)</div>
              <div className="text-zinc-400 mt-0.5 leading-relaxed">
                {invoice.duplicateReason || 'A bill with this invoice number already exists in your ledger.'}
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Split: Coding & Accounting details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Column: General Ledger Coding */}
          <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-3">
            <div className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>Step 2: Account Coding</span>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                GL: {glAccountCode}
              </span>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Expense Account (Chart of Accounts)</label>
              <select
                value={glAccountCode}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                {accounts.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} — {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1">Total Bill Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-100 font-mono font-medium focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Entity / Location</label>
                <input
                  type="text"
                  value={entityLocation}
                  onChange={(e) => setEntityLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Payment Method</label>
              <input
                type="text"
                disabled
                value={invoice.paymentMethod || 'Corporate Card'}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-400"
              />
            </div>
          </div>

          {/* Right Column: Live Balanced Journal Entry Preview */}
          <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-zinc-300 flex items-center justify-between mb-2">
                <span>Step 3: Continuous Ledger Preview</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Balanced
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-3">
                Double-entry transaction posted directly to QuickBooks Online.
              </p>

              <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/40 text-[11px]">
                <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex justify-between text-zinc-400 font-medium">
                  <span>Account Entry</span>
                  <div className="flex gap-8">
                    <span>Debit</span>
                    <span>Credit</span>
                  </div>
                </div>
                <div className="p-3 space-y-2 font-mono">
                  <div className="flex justify-between items-center text-zinc-200">
                    <span className="font-sans truncate max-w-[150px]">{glAccountCode} {glAccountName}</span>
                    <div className="flex gap-8">
                      <span className="text-zinc-100 font-medium">${totalAmount?.toFixed(2)}</span>
                      <span className="text-zinc-600">-</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans truncate max-w-[150px]">2000 Accounts Payable</span>
                    <div className="flex gap-8">
                      <span className="text-zinc-600">-</span>
                      <span className="text-zinc-100 font-medium">${totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-800/60 mt-3 flex justify-between">
              <span>Standard: GAAP Accrual</span>
              <span>Idempotent Sync Key</span>
            </div>
          </div>

        </div>

        {/* Line Items Table */}
        <div>
          <div className="font-semibold text-zinc-400 mb-2">Line Items Breakdown</div>
          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/40">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-900/60">
                  <th className="py-2 px-3 font-medium">Description</th>
                  <th className="py-2 px-3 font-medium text-center">Qty</th>
                  <th className="py-2 px-3 font-medium text-right">Unit Price</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {invoice.lineItems && invoice.lineItems.length > 0 ? (
                  invoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">{item.description}</td>
                      <td className="py-2 px-3 text-center text-zinc-400">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono text-zinc-400">${item.unitPrice?.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-zinc-100 font-medium">${item.amount?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 px-3">Standard vendor service charge</td>
                    <td className="py-2 px-3 text-center text-zinc-400">1</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-400">${totalAmount?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-100 font-medium">${totalAmount?.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collapsible Audit History */}
        <div className="pt-1">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 font-medium transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showAudit ? 'Hide Audit Log' : `Audit Log (${auditLogs.length} events)`}</span>
          </button>

          {showAudit && (
            <div className="mt-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800 max-h-36 overflow-y-auto space-y-1.5 text-[11px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-zinc-400">
                  <span className="text-zinc-200 font-medium">{log.action}: </span>
                  <span>{log.details}</span>
                  <span className="text-zinc-600 ml-2">({new Date(log.timestamp).toLocaleTimeString()})</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
