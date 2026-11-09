import React from 'react';
import { X, BookOpen } from 'lucide-react';
import type { ChartOfAccount } from '../types';

interface AccountsModalProps {
  accounts: ChartOfAccount[];
  onClose: () => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({ accounts, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-zinc-100">Chart of Accounts (General Ledger)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Accounts Table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-zinc-900/60 sticky top-0">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Account Name</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">Mapped Vendors / Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {accounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-zinc-900/50">
                  <td className="py-2.5 px-4 font-mono font-medium text-zinc-100">{acc.code}</td>
                  <td className="py-2.5 px-4 font-medium text-zinc-200">{acc.name}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{acc.category}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{acc.defaultDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800 flex justify-end bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
