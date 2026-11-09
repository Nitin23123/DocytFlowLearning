import React from 'react';
import { Layers, RefreshCw, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenIngest: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenIngest,
  onResetDemo,
  isResetting,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Docyt<span className="text-emerald-400">Flow</span></span>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                AP Automation
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Flow Indicator for Interview explanation */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
          <span className="text-emerald-400 font-medium">1. Ingest (AI)</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-medium">2. Review (Human)</span>
          <span className="text-slate-600">→</span>
          <span className="text-teal-400 font-medium">3. Sync (QuickBooks)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset to clean demo data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Test Ingestion</span>
          </button>
        </div>

      </div>
    </header>
  );
};
