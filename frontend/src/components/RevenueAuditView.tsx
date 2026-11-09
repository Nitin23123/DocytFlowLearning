import React, { useState, useEffect } from 'react';
import type { DailyRevenueAudit } from '../types';
import { api } from '../services/api';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  DollarSign,
  UtensilsCrossed,
  Hotel
} from 'lucide-react';

export const RevenueAuditView: React.FC = () => {
  const [audits, setAudits] = useState<DailyRevenueAudit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<DailyRevenueAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const data = await api.getRevenueAudits();
      setAudits(data);
      if (data.length > 0) setSelectedAudit(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostRevenueToLedger = async () => {
    if (!selectedAudit) return;
    setIsPosting(true);
    try {
      const updated = await api.syncRevenueAudit(selectedAudit.id);
      setSelectedAudit(updated);
      setAudits((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      alert('Failed to post revenue journal entry');
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500">
        Loading POS & PMS Night Audit reconciliation streams...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-200 text-xs">
            POS
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
              <span>Daily Sales & Revenue Audit Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                Hospitality Continuous Close
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Reconciles daily POS / PMS register sales against actual credit card settlement batches and bank vault cash.
            </p>
          </div>
        </div>

        {/* Audit Report Selector */}
        <div className="flex gap-2">
          {audits.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAudit(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedAudit?.id === a.id
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>{a.entityName.includes('Hotel') ? '🏨 Hotel' : '🍽️ Bistro'}</span>
              <span className="text-zinc-500 ml-1.5 font-mono">({a.auditDate})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Audit Reconciliation Workstation */}
      {selectedAudit && (
        <div className="flex-1 border border-zinc-800 rounded-xl bg-zinc-900/30 flex flex-col overflow-hidden">
          
          {/* Top Bar */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">{selectedAudit.entityName}</h2>
                <span className="text-xs text-zinc-400 font-mono">Date: {selectedAudit.auditDate}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{selectedAudit.notes}</div>
            </div>

            <div>
              {selectedAudit.isSyncedToLedger ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Posted to QuickBooks ({selectedAudit.syncTransactionId})</span>
                </div>
              ) : selectedAudit.variance === 0 ? (
                <button
                  onClick={handlePostRevenueToLedger}
                  disabled={isPosting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 transition active:scale-95 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                  <span>{isPosting ? 'Posting...' : 'Post Reconciled Revenue to QBO'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePostRevenueToLedger}
                  disabled={isPosting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition"
                >
                  <span>{isPosting ? 'Posting...' : 'Sign-Off Variance & Post'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 3-Column Reconciliation Breakdown */}
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
            
            {/* Column 1: Gross Register Sales (PMS / POS) (5 cols) */}
            <div className="md:col-span-5 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-zinc-400" />
                    <span>1. POS / PMS Gross Sales</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Opera & Toast</span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-4">
                  Aggregated revenue recorded at the terminals.
                </p>

                <div className="space-y-2.5 font-mono">
                  {selectedAudit.roomRevenue > 0 && (
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-sans">Room Revenue (Opera PMS):</span>
                      <span className="font-semibold text-zinc-100">${selectedAudit.roomRevenue?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="font-sans">Food Sales (Toast Dining):</span>
                    <span className="font-semibold text-zinc-100">${selectedAudit.foodSales?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="font-sans">Beverage & Cocktails:</span>
                    <span className="font-semibold text-zinc-100">${selectedAudit.beverageSales?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">State & City Sales Tax:</span>
                    <span>${selectedAudit.salesTax?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center font-bold text-sm text-zinc-100 mt-4">
                <span className="font-sans">Total POS Gross Sales:</span>
                <span className="font-mono text-base">${selectedAudit.grossSalesTotal?.toFixed(2)}</span>
              </div>
            </div>

            {/* Column 2: Bank Deposits & Merchant Settlements (5 cols) */}
            <div className="md:col-span-5 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span>2. Settlements & Cash Deposit</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Bank Feed</span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-4">
                  Actual funds deposited into operating bank accounts.
                </p>

                <div className="space-y-2.5 font-mono">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="font-sans">Visa / Mastercard Batch:</span>
                    <span className="font-semibold text-zinc-100">${selectedAudit.creditCardSettlement?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="font-sans">American Express Settlement:</span>
                    <span className="font-semibold text-zinc-100">${selectedAudit.amexSettlement?.toFixed(2)}</span>
                  </div>
                  {selectedAudit.deliveryAppPayouts > 0 && (
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-sans">DoorDash / Delivery Payout:</span>
                      <span className="font-semibold text-zinc-100">${selectedAudit.deliveryAppPayouts?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="font-sans">Vault Cash Deposited:</span>
                    <span className="font-semibold text-zinc-100">${selectedAudit.cashDeposit?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-sans">Gateway Processing Fees:</span>
                    <span className="text-zinc-400 font-mono">${selectedAudit.merchantProcessorFees?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center font-bold text-sm text-zinc-100 mt-4">
                <span className="font-sans">Total Accounted For:</span>
                <span className="font-mono text-base">
                  ${(selectedAudit.netSettlementTotal + selectedAudit.merchantProcessorFees)?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Column 3: Variance & Reconciliation Invariant (2 cols) */}
            <div className="md:col-span-2 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col items-center justify-center text-center">
              {selectedAudit.variance === 0 ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-zinc-100 text-sm">Balanced</div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">$0.00 Variance</div>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                    100% matched across merchant processors and POS daily sales.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-rose-300 text-sm">Discrepancy</div>
                  <div className="text-[11px] text-rose-400 font-mono font-bold mt-1">
                    ${selectedAudit.variance?.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                    Cash drawer shortage flagged for general manager audit.
                  </p>
                </>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
