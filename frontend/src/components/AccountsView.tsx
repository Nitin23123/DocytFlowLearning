import React from 'react';
import type { ChartOfAccount } from '../types';

interface AccountsViewProps {
  accounts: ChartOfAccount[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts }) => {
  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-100">Chart of Accounts</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          General Ledger accounts configured for automatic expense categorization.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Account Name</th>
              <th className="py-3 px-4">Type / Category</th>
              <th className="py-3 px-4">Default Rules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {accounts.map((acc) => (
              <tr key={acc.code} className="hover:bg-zinc-850/50">
                <td className="py-3 px-4 font-mono font-medium text-zinc-100">{acc.code}</td>
                <td className="py-3 px-4 font-medium text-zinc-200">{acc.name}</td>
                <td className="py-3 px-4 text-zinc-400">{acc.category}</td>
                <td className="py-3 px-4 text-zinc-400">{acc.defaultDescription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
