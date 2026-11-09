import React from 'react';
import { X, Check } from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-zinc-100">Journal Entry {entry.entryNumber}</div>
            <div className="text-xs text-zinc-400 mt-0.5">QuickBooks Online Sync</div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex justify-between font-medium text-zinc-400">
              <span>Account</span>
              <div className="flex gap-10">
                <span>Debit</span>
                <span>Credit</span>
              </div>
            </div>

            <div className="p-4 space-y-2.5 font-mono">
              <div className="flex justify-between items-center text-zinc-200">
                <span className="font-sans font-medium">{entry.debitAccount}</span>
                <div className="flex gap-10">
                  <span className="text-zinc-100">${entry.debitAmount?.toFixed(2)}</span>
                  <span className="text-zinc-600">-</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="font-sans font-medium pl-3">{entry.creditAccount}</span>
                <div className="flex gap-10">
                  <span className="text-zinc-600">-</span>
                  <span className="text-zinc-100">${entry.creditAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-sans font-medium text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Balanced
                </span>
                <div className="flex gap-10 font-mono text-zinc-200 font-semibold">
                  <span>${entry.debitAmount?.toFixed(2)}</span>
                  <span>${entry.creditAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Idempotency Key:</span>
              <span className="font-mono text-zinc-300">{entry.idempotencyKey}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Timestamp:</span>
              <span>{entry.postedAt ? new Date(entry.postedAt).toLocaleString() : 'Now'}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
