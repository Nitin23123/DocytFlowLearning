import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  BookOpen,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenAccounts: () => void;
  onReset: () => void;
  isResetting: boolean;
  selectedEntity: string;
  onSelectEntity: (entity: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenAccounts,
  onReset,
  isResetting,
  selectedEntity,
  onSelectEntity,
}) => {
  const entities = [
    'All Entities (Grand Hospitality Group)',
    'Grand Vista Hotel & Suites (140 Rooms)',
    'The Harbor Bistro & Lounge',
    'Metro Retail Boutique #104'
  ];

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      
      {/* Brand & Multi-Entity Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center font-bold text-zinc-950 text-xs">
            D
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">Docyt</span>
          <span className="text-zinc-600">/</span>
        </div>

        {/* Multi-Entity Dropdown */}
        <div className="relative group">
          <select
            value={selectedEntity}
            onChange={(e) => onSelectEntity(e.target.value)}
            className="appearance-none bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-md focus:outline-none focus:border-zinc-700 cursor-pointer transition"
          >
            {entities.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* QuickBooks Online Live Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>QuickBooks Online:</span>
          <span className="text-zinc-200 font-medium">Live</span>
        </div>

        {/* Chart of Accounts Link */}
        <button
          onClick={onOpenAccounts}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md border border-transparent hover:border-zinc-800 transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Chart of Accounts</span>
        </button>

        {/* Reset Demo */}
        <button
          onClick={onReset}
          disabled={isResetting}
          title="Reset to clean baseline data"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md border border-zinc-800 transition"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* New Bill Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload Bill</span>
        </button>
      </div>

    </header>
  );
};
