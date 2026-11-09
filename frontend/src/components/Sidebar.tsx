import React from 'react';
import { 
  FileText, 
  BookOpen, 
  RefreshCw, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onReset: () => void;
  isResetting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onReset,
  isResetting,
}) => {
  const navItems = [
    { id: 'invoices', label: 'Invoices & Bills', icon: FileText },
    { id: 'accounts', label: 'Chart of Accounts', icon: BookOpen },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 hidden md:flex min-h-screen">
      <div>
        {/* Workspace Brand */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Layers className="w-4 h-4 text-zinc-100" />
            </div>
            <div>
              <div className="font-semibold text-sm text-zinc-100 tracking-tight">Docyt</div>
              <div className="text-[11px] text-zinc-500 font-medium">Accounting Hub</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Finance
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Reset */}
      <div className="p-4 border-t border-zinc-800 space-y-3">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span>QuickBooks</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="font-medium text-zinc-200">Connected</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Continuous sync active</div>
        </div>

        <button
          onClick={onReset}
          disabled={isResetting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
