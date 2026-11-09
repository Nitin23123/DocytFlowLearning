import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { QueueList } from './components/QueueList';
import { DetailWorkstation } from './components/DetailWorkstation';
import { NewInvoiceModal } from './components/NewInvoiceModal';
import { AccountsModal } from './components/AccountsModal';
import { JournalModal } from './components/JournalModal';
import { api } from './services/api';
import type { InvoiceDocument, ChartOfAccount, DashboardStats, JournalEntry } from './types';

export function App() {
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDocument | null>(null);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('All Entities (Grand Hospitality Group)');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invList, statsData, coaList] = await Promise.all([
        api.getInvoices(),
        api.getStats(),
        api.getAccounts(),
      ]);
      setInvoices(invList);
      setStats(statsData);
      setAccounts(coaList);

      // Auto-select the first invoice if none selected
      if (invList.length > 0 && !selectedInvoice) {
        setSelectedInvoice(invList[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      await loadData();
    } catch (err) {
      alert('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const handleInvoiceUpdated = (updated: InvoiceDocument) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setSelectedInvoice(updated);
    api.getStats().then(setStats).catch(console.error);
  };

  const handleSynced = (je: JournalEntry) => {
    setSelectedJournalEntry(je);
    loadData();
  };

  const handleViewJournal = async (id: number) => {
    try {
      const je = await api.getJournalEntry(id);
      if (je) setSelectedJournalEntry(je);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewInvoiceSuccess = (newInv: InvoiceDocument) => {
    setInvoices((prev) => [newInv, ...prev]);
    setSelectedInvoice(newInv);
    api.getStats().then(setStats).catch(console.error);
  };

  // Filter invoices by selected entity
  const entityFilteredInvoices = invoices.filter((inv) => {
    if (selectedEntity.includes('All Entities')) return true;
    if (selectedEntity.includes('Grand Vista')) return inv.entityLocation?.includes('Grand Vista') || inv.entityLocation?.includes('Hotel');
    if (selectedEntity.includes('Harbor Bistro')) return inv.entityLocation?.includes('Harbor') || inv.entityLocation?.includes('Bistro');
    if (selectedEntity.includes('Metro Retail')) return inv.entityLocation?.includes('Retail');
    return true;
  });

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased overflow-hidden">
      
      {/* Top Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAccounts={() => setIsAccountsOpen(true)}
        onReset={handleReset}
        isResetting={isResetting}
        selectedEntity={selectedEntity}
        onSelectEntity={setSelectedEntity}
      />

      {/* Main Container */}
      <div className="flex-1 p-5 max-w-7xl w-full mx-auto flex flex-col overflow-hidden">
        
        {/* KPI Strip */}
        <StatsOverview
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* 2-Pane Split Workstation: Queue on Left, Workstation on Right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden min-h-0">
          
          {/* Left Pane: Queue (5 cols on md, 4 cols on lg) */}
          <div className="md:col-span-5 lg:col-span-4 h-full overflow-hidden">
            <QueueList
              invoices={entityFilteredInvoices}
              selectedId={selectedInvoice?.id || null}
              onSelect={setSelectedInvoice}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Pane: Detail Workstation (7 cols on md, 8 cols on lg) */}
          <div className="md:col-span-7 lg:col-span-8 h-full overflow-hidden">
            <DetailWorkstation
              invoice={selectedInvoice}
              accounts={accounts}
              onInvoiceUpdated={handleInvoiceUpdated}
              onSynced={handleSynced}
              onViewJournal={handleViewJournal}
            />
          </div>

        </div>

      </div>

      {/* Upload Bill Modal */}
      {isUploadOpen && (
        <NewInvoiceModal
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleNewInvoiceSuccess}
        />
      )}

      {/* Chart of Accounts Modal */}
      {isAccountsOpen && (
        <AccountsModal
          accounts={accounts}
          onClose={() => setIsAccountsOpen(false)}
        />
      )}

      {/* Journal Entry Modal */}
      {selectedJournalEntry && (
        <JournalModal
          entry={selectedJournalEntry}
          onClose={() => setSelectedJournalEntry(null)}
        />
      )}

    </div>
  );
}

export default App;
