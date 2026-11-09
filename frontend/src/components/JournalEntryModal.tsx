import React from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Layers, Hash } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalEntryModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">General Ledger Journal Entry</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  {entry.entryNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">Posted to QuickBooks Online via Continuous Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Double-Entry Ledger Card */}
        <div className="p-6 space-y-6">
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span>Account Name & Classification</span>
              <div className="flex gap-12 pr-2">
                <span>Debit</span>
                <span>Credit</span>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Debit Row (Expense) */}
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <div>
                  <div className="font-semibold text-white">{entry.debitAccount}</div>
                  <div className="text-[11px] text-slate-500">Operating Expense • General Ledger</div>
                </div>
                <div className="flex gap-12 font-mono font-bold">
                  <span className="text-emerald-400">${entry.debitAmount?.toFixed(2)}</span>
                  <span className="text-slate-600">-</span>
                </div>
              </div>

              {/* Credit Row (Accounts Payable Liability) */}
              <div className="flex justify-between items-center py-2">
                <div className="pl-4 border-l-2 border-slate-700">
                  <div className="font-semibold text-slate-200">{entry.creditAccount}</div>
                  <div className="text-[11px] text-slate-500">Current Liability • Accounts Payable</div>
                </div>
                <div className="flex gap-12 font-mono font-bold">
                  <span className="text-slate-600">-</span>
                  <span className="text-emerald-400">${entry.creditAmount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Balanced Verification Footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Double-Entry Balanced (Debits = Credits)</span>
                </div>
                <div className="flex gap-12 font-mono text-white pr-1">
                  <span>${entry.debitAmount?.toFixed(2)}</span>
                  <span>${entry.creditAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Metadata (Fintech specific) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Fintech Sync Metadata
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Idempotency Key:</span>
                <div className="font-mono text-slate-300 truncate mt-0.5" title={entry.idempotencyKey}>
                  {entry.idempotencyKey}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Target Integration:</span>
                <div className="text-slate-300 font-medium mt-0.5">{entry.targetSystem}</div>
              </div>
              <div>
                <span className="text-slate-500">Posted Timestamp:</span>
                <div className="font-mono text-slate-300 mt-0.5">
                  {entry.postedAt ? new Date(entry.postedAt).toLocaleString() : 'Just now'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Audit Status:</span>
                <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Immutable Record
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
