package com.example.demo.service;

import com.example.demo.dto.DashboardStats;
import com.example.demo.dto.InvoiceIngestRequest;
import com.example.demo.dto.InvoiceUpdateRequest;
import com.example.demo.model.*;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.repository.ChartOfAccountRepository;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ChartOfAccountRepository coaRepository;
    private final AuditLogRepository auditLogRepository;
    private final JournalEntryRepository journalEntryRepository;

    public List<InvoiceDocument> getAllInvoices() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    public InvoiceDocument getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    public List<ChartOfAccount> getAllAccounts() {
        return coaRepository.findAll();
    }

    public List<AuditLog> getAuditLogsForInvoice(Long invoiceId) {
        return auditLogRepository.findByInvoiceIdOrderByTimestampDesc(invoiceId);
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }

    public Optional<JournalEntry> getJournalEntryForInvoice(Long invoiceId) {
        return journalEntryRepository.findByInvoiceId(invoiceId);
    }

    @Transactional
    public InvoiceDocument updateInvoice(Long id, InvoiceUpdateRequest request) {
        InvoiceDocument invoice = getInvoiceById(id);
        StringBuilder changes = new StringBuilder();

        if (request.getVendorName() != null && !request.getVendorName().equalsIgnoreCase(invoice.getVendorName())) {
            changes.append(String.format("Vendor changed from '%s' to '%s'. ", invoice.getVendorName(), request.getVendorName()));
            invoice.setVendorName(request.getVendorName());
        }

        if (request.getTotalAmount() != null && !request.getTotalAmount().equals(invoice.getTotalAmount())) {
            changes.append(String.format("Amount changed from $%s to $%s. ", invoice.getTotalAmount(), request.getTotalAmount()));
            invoice.setTotalAmount(request.getTotalAmount());
        }

        if (request.getGlAccountCode() != null && !request.getGlAccountCode().equals(invoice.getGlAccountCode())) {
            changes.append(String.format("GL Account changed from '%s' to '%s - %s'. ", 
                    invoice.getGlAccountCode(), request.getGlAccountCode(), request.getGlAccountName()));
            invoice.setGlAccountCode(request.getGlAccountCode());
            invoice.setGlAccountName(request.getGlAccountName());
        }

        if (request.getNotes() != null) {
            invoice.setNotes(request.getNotes());
        }

        if (request.getStatus() != null && request.getStatus() != invoice.getStatus()) {
            changes.append(String.format("Status updated to %s. ", request.getStatus()));
            invoice.setStatus(request.getStatus());
        }

        if (request.getEntityLocation() != null) {
            invoice.setEntityLocation(request.getEntityLocation());
        }

        InvoiceDocument updated = invoiceRepository.save(invoice);

        String user = request.getUserEmail() != null ? request.getUserEmail() : "Controller (Manual Review)";
        auditLogRepository.save(AuditLog.builder()
                .invoiceId(id)
                .action("MANUAL_REVIEW_UPDATE")
                .performedBy(user)
                .details(changes.length() > 0 ? changes.toString() : "Updated invoice details.")
                .timestamp(LocalDateTime.now())
                .build());

        return updated;
    }

    @Transactional
    public InvoiceDocument approveInvoice(Long id, String approvedBy) {
        InvoiceDocument invoice = getInvoiceById(id);
        invoice.setStatus(InvoiceStatus.APPROVED);
        InvoiceDocument saved = invoiceRepository.save(invoice);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(id)
                .action("INVOICE_APPROVED")
                .performedBy(approvedBy != null ? approvedBy : "Product Engineer / Controller")
                .details("Invoice approved for General Ledger posting.")
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Transactional
    public JournalEntry syncToLedger(Long id) {
        InvoiceDocument invoice = getInvoiceById(id);
        if (Boolean.TRUE.equals(invoice.getIsSynced())) {
            return journalEntryRepository.findByInvoiceId(id)
                    .orElseThrow(() -> new IllegalStateException("Invoice already synced but JE missing"));
        }

        // Generate Idempotency Key (Standard practice in Fintech & Docyt sync engine)
        String idempotencyKey = "QBO-SYNC-" + invoice.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        String entryNumber = "JE-2026-" + (1000 + invoice.getId());

        // Create Balanced Double-Entry Journal Entry:
        // Debit: Expense Account (e.g. 6080 Cloud Hosting)
        // Credit: 2000 Accounts Payable (Liability)
        JournalEntry entry = JournalEntry.builder()
                .invoiceId(invoice.getId())
                .entryNumber(entryNumber)
                .debitAccount(invoice.getGlAccountCode() + " - " + invoice.getGlAccountName())
                .debitAmount(invoice.getTotalAmount())
                .creditAccount("2000 - Accounts Payable")
                .creditAmount(invoice.getTotalAmount())
                .idempotencyKey(idempotencyKey)
                .targetSystem("QuickBooks Online API (Continuous Sync)")
                .postedAt(LocalDateTime.now())
                .build();

        JournalEntry savedEntry = journalEntryRepository.save(entry);

        invoice.setIsSynced(true);
        invoice.setStatus(InvoiceStatus.SYNCED_TO_LEDGER);
        invoice.setSyncTransactionId(savedEntry.getEntryNumber());
        invoice.setSyncedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(id)
                .action("LEDGER_POSTED")
                .performedBy("Docyt Auto-Sync Engine")
                .details(String.format("Synced to QuickBooks. Balanced entry posted: Debit %s $%s / Credit Accounts Payable $%s. Ref: %s",
                        invoice.getGlAccountName(), invoice.getTotalAmount(), invoice.getTotalAmount(), entryNumber))
                .timestamp(LocalDateTime.now())
                .build());

        return savedEntry;
    }

    @Transactional
    public InvoiceDocument ingestInvoice(InvoiceIngestRequest req) {
        // AI Categorization engine simulation based on vendor & line item keywords
        Map.Entry<String, String> glCategory = predictGLCategory(req.getVendorName(), req.getLineItems());

        // Anomaly / Duplicate Detection Engine
        boolean isDuplicate = invoiceRepository.existsByVendorNameIgnoreCaseAndInvoiceNumberIgnoreCase(
                req.getVendorName(), req.getInvoiceNumber());
        
        boolean amountMatch = invoiceRepository.existsByVendorNameIgnoreCaseAndTotalAmount(
                req.getVendorName(), req.getTotalAmount());

        int baseConfidence = 96;
        String dupReason = null;

        if (isDuplicate) {
            baseConfidence = 35;
            dupReason = "Exact duplicate invoice number found for vendor: " + req.getVendorName();
        } else if (amountMatch) {
            baseConfidence = 60;
            dupReason = "Identical amount found for this vendor in a recent bill. Please verify.";
        }

        InvoiceStatus initialStatus = (isDuplicate || amountMatch) 
                ? InvoiceStatus.FLAGGED_DUPLICATE 
                : (baseConfidence < 80 ? InvoiceStatus.NEEDS_ATTENTION : InvoiceStatus.PENDING_REVIEW);

        InvoiceDocument doc = InvoiceDocument.builder()
                .invoiceNumber(req.getInvoiceNumber() != null ? req.getInvoiceNumber() : "INV-" + System.currentTimeMillis() % 100000)
                .vendorName(req.getVendorName())
                .invoiceDate(req.getInvoiceDate())
                .dueDate(req.getDueDate())
                .subtotal(req.getSubtotal() != null ? req.getSubtotal() : req.getTotalAmount())
                .taxAmount(req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO)
                .totalAmount(req.getTotalAmount())
                .overallConfidence(baseConfidence)
                .vendorConfidence(Math.min(99, baseConfidence + 2))
                .amountConfidence(Math.min(98, baseConfidence + 1))
                .dateConfidence(Math.min(95, baseConfidence - 2))
                .status(initialStatus)
                .glAccountCode(glCategory.getKey())
                .glAccountName(glCategory.getValue())
                .entityLocation(req.getEntityLocation() != null ? req.getEntityLocation() : "Docyt HQ - San Francisco")
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "Corporate Credit Card")
                .isDuplicateFlagged(isDuplicate || amountMatch)
                .duplicateReason(dupReason)
                .isSynced(false)
                .build();

        if (req.getLineItems() != null) {
            for (InvoiceIngestRequest.LineItemDto itemDto : req.getLineItems()) {
                InvoiceLineItem lineItem = InvoiceLineItem.builder()
                        .invoice(doc)
                        .description(itemDto.getDescription())
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                        .unitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : itemDto.getAmount())
                        .amount(itemDto.getAmount())
                        .suggestedCategory(glCategory.getValue())
                        .build();
                doc.getLineItems().add(lineItem);
            }
        }

        InvoiceDocument saved = invoiceRepository.save(doc);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved.getId())
                .action("OCR_INGESTION_COMPLETED")
                .performedBy("Docyt Vision AI Extractor")
                .details(String.format("Parsed %s with %d%% confidence. Auto-suggested GL Account: %s (%s)",
                        saved.getVendorName(), baseConfidence, glCategory.getKey(), glCategory.getValue()))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    public DashboardStats getDashboardStats() {
        List<InvoiceDocument> all = invoiceRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(i -> i.getStatus() == InvoiceStatus.PENDING_REVIEW).count();
        long lowConf = all.stream().filter(i -> i.getOverallConfidence() != null && i.getOverallConfidence() < 80).count();
        long synced = all.stream().filter(i -> Boolean.TRUE.equals(i.getIsSynced())).count();
        long duplicates = all.stream().filter(i -> Boolean.TRUE.equals(i.getIsDuplicateFlagged())).count();

        BigDecimal totalAP = all.stream()
                .map(InvoiceDocument::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = all.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PENDING_REVIEW || i.getStatus() == InvoiceStatus.NEEDS_ATTENTION)
                .map(InvoiceDocument::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal syncedAmount = all.stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsSynced()))
                .map(InvoiceDocument::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double rate = total > 0 ? ((double) (total - lowConf) / total) * 100.0 : 92.0;

        return DashboardStats.builder()
                .totalInvoices(total)
                .pendingReviewCount(pending)
                .lowConfidenceCount(lowConf)
                .syncedCount(synced)
                .duplicateFlaggedCount(duplicates)
                .totalAccountsPayable(totalAP)
                .pendingReviewAmount(pendingAmount)
                .syncedAmount(syncedAmount)
                .autoCategorizationRate(Math.round(rate * 10.0) / 10.0)
                .build();
    }

    private Map.Entry<String, String> predictGLCategory(String vendor, List<InvoiceIngestRequest.LineItemDto> lineItems) {
        String lowerVendor = vendor != null ? vendor.toLowerCase() : "";
        String desc = "";
        if (lineItems != null && !lineItems.isEmpty()) {
            desc = lineItems.get(0).getDescription() != null ? lineItems.get(0).getDescription().toLowerCase() : "";
        }

        if (lowerVendor.contains("ecolab") || lowerVendor.contains("cintas") || lowerVendor.contains("linen") 
                || desc.contains("laundry") || desc.contains("linen") || desc.contains("detergent")) {
            return Map.entry("6150", "Guest Linen & Commercial Laundry");
        } else if (lowerVendor.contains("sysco") || lowerVendor.contains("us foods") || lowerVendor.contains("restaurant")
                || desc.contains("meat") || desc.contains("produce") || desc.contains("food") || desc.contains("salmon")) {
            return Map.entry("5010", "Cost of Goods Sold - Food & Beverage");
        } else if (lowerVendor.contains("opera") || lowerVendor.contains("oracle") || lowerVendor.contains("toast") 
                || lowerVendor.contains("cloudbeds") || lowerVendor.contains("pos") || lowerVendor.contains("pms")) {
            return Map.entry("6080", "Hotel PMS & Restaurant POS Software");
        } else if (lowerVendor.contains("electric") || lowerVendor.contains("gas") || lowerVendor.contains("water") 
                || lowerVendor.contains("pge") || lowerVendor.contains("utility")) {
            return Map.entry("6120", "Hotel Utilities (Electric, Water, Gas)");
        } else if (lowerVendor.contains("guest supply") || lowerVendor.contains("amenit") || desc.contains("shampoo") 
                || desc.contains("soap") || desc.contains("keycard") || desc.contains("toiletries")) {
            return Map.entry("6050", "Guest Room Amenities & Supplies");
        } else if (lowerVendor.contains("lease") || lowerVendor.contains("franchise") || lowerVendor.contains("royalty") 
                || lowerVendor.contains("hilton") || lowerVendor.contains("marriott")) {
            return Map.entry("6040", "Property Lease & Franchise Fees");
        } else if (lowerVendor.contains("uber") || lowerVendor.contains("delta") || lowerVendor.contains("travel")) {
            return Map.entry("6100", "Staff Travel & Hospitality Events");
        }

        return Map.entry("6090", "General Hotel Operating Expense");
    }
}
