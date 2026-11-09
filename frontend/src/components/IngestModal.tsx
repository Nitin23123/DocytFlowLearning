import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { InvoiceDocument } from '../types';

interface IngestModalProps {
  onClose: () => void;
  onIngestSuccess: (invoice: InvoiceDocument) => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ onClose, onIngestSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string>('');

  const runScenario = async (type: 'AWS' | 'STAPLES' | 'SYSCO') => {
    setIsProcessing(true);

    let payload: any = {};
    if (type === 'AWS') {
      setCurrentScenario('Extracting AWS invoice (High Confidence)...');
      payload = {
        vendorName: 'Amazon Web Services',
        invoiceNumber: `AWS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        subtotal: 1250.00,
        taxAmount: 112.50,
        totalAmount: 1362.50,
        entityLocation: 'Docyt HQ - San Francisco',
        lineItems: [
          { description: 'AWS Production Cluster Hosting', quantity: 1, unitPrice: 1250.00, amount: 1250.00 }
        ]
      };
    } else if (type === 'STAPLES') {
      setCurrentScenario('Extracting blurry receipt (Low Confidence)...');
      payload = {
        vendorName: 'Staples Office Solutions',
        invoiceNumber: `STP-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        subtotal: 110.00,
        taxAmount: 14.90,
        totalAmount: 124.90,
        entityLocation: 'Docyt HQ - San Francisco',
        lineItems: [
          { description: 'Printer Toner & Copy Paper', quantity: 1, unitPrice: 110.00, amount: 110.00 }
        ]
      };
    } else if (type === 'SYSCO') {
      setCurrentScenario('Detecting duplicate bill anomaly...');
      payload = {
        vendorName: 'Sysco Food Services',
        invoiceNumber: 'SYS-882194-A', // exact duplicate invoice #
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        subtotal: 3200.00,
        taxAmount: 220.00,
        totalAmount: 3420.00,
        entityLocation: 'Downtown Bistro Unit #12',
        lineItems: [
          { description: 'Bulk Meat & Produce', quantity: 1, unitPrice: 3200.00, amount: 3200.00 }
        ]
      };
    }

    try {
      await new Promise((r) => setTimeout(r, 600));
      const created = await api.ingestInvoice(payload);
      onIngestSuccess(created);
      onClose();
    } catch (err) {
      alert('Ingestion simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const scenarios = [
    {
      type: 'AWS' as const,
      title: 'Standard Invoice',
      vendor: 'Amazon Web Services ($1,362.50)',
      description: 'High 97% confidence. Automatically matches "6080 Cloud Hosting" category.',
      badge: '97% Confidence',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
    },
    {
      type: 'STAPLES' as const,
      title: 'Blurry Receipt Scan',
      vendor: 'Staples Supplies ($124.90)',
      description: 'Low 68% confidence. Automatically routes to human review queue.',
      badge: 'Needs Review',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Clock,
      iconColor: 'text-amber-400',
    },
    {
      type: 'SYSCO' as const,
      title: 'Duplicate Bill Anomaly',
      vendor: 'Sysco Foods ($3,420.00)',
      description: 'Duplicate invoice #SYS-882194-A already in ledger. Triggers fraud alert.',
      badge: 'Duplicate Warning',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Simulate Document Ingestion</h2>
            <p className="text-xs text-slate-400">Select a test scenario to demonstrate the AI pipeline</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Simple Scenarios */}
        <div className="p-6 space-y-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.type}
                type="button"
                disabled={isProcessing}
                onClick={() => runScenario(sc.type)}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition flex items-start gap-3.5 group"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  <Icon className={`w-4 h-4 ${sc.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {sc.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-300">{sc.vendor}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sc.description}</div>
                </div>
              </button>
            );
          })}

          {isProcessing && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-medium text-emerald-300 animate-pulse">
              {currentScenario}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
