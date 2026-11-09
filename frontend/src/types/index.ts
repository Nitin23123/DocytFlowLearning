export type InvoiceStatus = 
  | 'PENDING_REVIEW' 
  | 'NEEDS_ATTENTION' 
  | 'APPROVED' 
  | 'SYNCED_TO_LEDGER' 
  | 'REJECTED' 
  | 'FLAGGED_DUPLICATE';

export interface InvoiceLineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  suggestedCategory?: string;
}

export interface InvoiceDocument {
  id: number;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  overallConfidence: number;
  vendorConfidence: number;
  amountConfidence: number;
  dateConfidence: number;
  status: InvoiceStatus;
  glAccountCode: string;
  glAccountName: string;
  entityLocation: string;
  paymentMethod: string;
  notes?: string;
  documentPreview?: string;
  isDuplicateFlagged: boolean;
  duplicateReason?: string;
  isSynced: boolean;
  syncTransactionId?: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt?: string;
  lineItems: InvoiceLineItem[];
}

export interface ChartOfAccount {
  code: string;
  name: string;
  category: string;
  defaultDescription: string;
}

export interface AuditLog {
  id: number;
  invoiceId: number;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface JournalEntry {
  id: number;
  invoiceId: number;
  entryNumber: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  idempotencyKey: string;
  targetSystem: string;
  postedAt: string;
}

export interface DashboardStats {
  totalInvoices: number;
  pendingReviewCount: number;
  lowConfidenceCount: number;
  syncedCount: number;
  duplicateFlaggedCount: number;
  totalAccountsPayable: number;
  pendingReviewAmount: number;
  syncedAmount: number;
  autoCategorizationRate: number;
}
