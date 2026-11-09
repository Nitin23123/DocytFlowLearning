import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { InvoiceDocument } from '../types';

interface NewInvoiceModalProps {
  onClose: () => void;
  onSuccess: (invoice: InvoiceDocument) => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreset = async (preset: 'ecolab' | 'toast' | 'sysco') => {
    setIsSubmitting(true);
    let payload: any = {};

    if (preset === 'ecolab') {
      payload = {
        vendorName: 'Ecolab Laundry & Sanitation',
        invoiceNumber: `ECO-${Math.floor(10000 + Math.random() * 90000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        subtotal: 1600.00,
        taxAmount: 140.00,
        totalAmount: 1740.00,
        entityLocation: 'Grand Vista Hotel & Suites',
        lineItems: [
          { description: 'Commercial Laundry Detergent & Linen Disinfectant Drums', quantity: 4, unitPrice: 400.00, amount: 1600.00 }
        ]
      };
    } else if (preset === 'toast') {
      payload = {
        vendorName: 'Toast POS Systems',
        invoiceNumber: `TOAST-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        subtotal: 299.00,
        taxAmount: 0,
        totalAmount: 299.00,
        entityLocation: 'The Harbor Bistro & Lounge',
        lineItems: [
          { description: 'Toast Restaurant POS Terminal Cloud Subscription (3 Terminals)', quantity: 1, unitPrice: 299.00, amount: 299.00 }
        ]
      };
    } else if (preset === 'sysco') {
      payload = {
        vendorName: 'Sysco Food Services',
        invoiceNumber: 'SYS-882194-A', // Existing invoice number to trigger duplicate flag
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        subtotal: 3200.00,
        taxAmount: 220.00,
        totalAmount: 3420.00,
        entityLocation: 'The Harbor Bistro & Lounge',
        lineItems: [
          { description: 'Prime Beef Ribs & Organic Produce', quantity: 1, unitPrice: 3200.00, amount: 3200.00 }
        ]
      };
    }

    try {
      const created = await api.ingestInvoice(payload);
      onSuccess(created);
      onClose();
    } catch (err) {
      alert('Failed to import invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-zinc-100">Upload Hospitality Bill</div>
            <div className="text-[11px] text-zinc-400">Simulate incoming vendor invoices for hotels & restaurants</div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Import Options */}
        <div className="p-6 space-y-3">
          <div className="text-xs text-zinc-400 mb-1">Select a hospitality invoice scenario:</div>

          <button
            onClick={() => handlePreset('ecolab')}
            disabled={isSubmitting}
            className="w-full p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-zinc-100 group-hover:text-white">🏨 Ecolab Laundry & Sanitation</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">$1,740.00 • Hotel Linen & Laundry Chemicals</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition" />
          </button>

          <button
            onClick={() => handlePreset('toast')}
            disabled={isSubmitting}
            className="w-full p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-zinc-100 group-hover:text-white">🍽️ Toast Restaurant POS</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">$299.00 • Restaurant POS Terminals & Software</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition" />
          </button>

          <button
            onClick={() => handlePreset('sysco')}
            disabled={isSubmitting}
            className="w-full p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="font-medium text-xs text-zinc-100 group-hover:text-white">🥩 Sysco Foods (Duplicate Anomaly)</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">$3,420.00 • Catches duplicate restaurant food bill</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition" />
          </button>
        </div>

      </div>
    </div>
  );
};
