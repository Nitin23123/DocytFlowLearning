import { InvoiceDocument, ChartOfAccount, AuditLog, JournalEntry, DashboardStats } from '../types';

const API_BASE = '/api/invoices';

export const api = {
  async getInvoices(): Promise<InvoiceDocument[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  async getInvoice(id: number): Promise<InvoiceDocument> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.json();
  },

  async updateInvoice(id: number, data: Partial<InvoiceDocument> & { userEmail?: string }): Promise<InvoiceDocument> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update invoice');
    return res.json();
  },

  async approveInvoice(id: number, approvedBy = 'Controller (Manual Review)'): Promise<InvoiceDocument> {
    const res = await fetch(`${API_BASE}/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    });
    if (!res.ok) throw new Error('Failed to approve invoice');
    return res.json();
  },

  async syncToLedger(id: number): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE}/${id}/sync`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to sync to ledger');
    return res.json();
  },

  async ingestInvoice(payload: any): Promise<InvoiceDocument> {
    const res = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to ingest invoice');
    return res.json();
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getAccounts(): Promise<ChartOfAccount[]> {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Failed to fetch chart of accounts');
    return res.json();
  },

  async getAuditLogs(id: number): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/${id}/audit`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getJournalEntry(id: number): Promise<JournalEntry | null> {
    const res = await fetch(`${API_BASE}/${id}/journal-entry`);
    if (res.status === 204) return null;
    if (!res.ok) throw new Error('Failed to fetch journal entry');
    return res.json();
  },

  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
  }
};
