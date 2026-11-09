package com.example.demo.controller;

import com.example.demo.config.DataInitializer;
import com.example.demo.dto.DashboardStats;
import com.example.demo.dto.InvoiceIngestRequest;
import com.example.demo.dto.InvoiceUpdateRequest;
import com.example.demo.model.*;
import com.example.demo.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final DataInitializer dataInitializer;

    @GetMapping
    public ResponseEntity<List<InvoiceDocument>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDocument> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDocument> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceUpdateRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<InvoiceDocument> approveInvoice(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String approvedBy = (payload != null && payload.containsKey("approvedBy")) 
                ? payload.get("approvedBy") 
                : "Controller (Manual Review)";
        return ResponseEntity.ok(invoiceService.approveInvoice(id, approvedBy));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<JournalEntry> syncToLedger(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.syncToLedger(id));
    }

    @PostMapping("/ingest")
    public ResponseEntity<InvoiceDocument> ingestInvoice(@RequestBody InvoiceIngestRequest request) {
        return ResponseEntity.ok(invoiceService.ingestInvoice(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(invoiceService.getDashboardStats());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<ChartOfAccount>> getChartOfAccounts() {
        return ResponseEntity.ok(invoiceService.getAllAccounts());
    }

    @GetMapping("/{id}/audit")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getAuditLogsForInvoice(id));
    }

    @GetMapping("/{id}/journal-entry")
    public ResponseEntity<?> getJournalEntry(@PathVariable Long id) {
        return invoiceService.getJournalEntryForInvoice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/reset-demo")
    public ResponseEntity<Map<String, String>> resetDemo() {
        dataInitializer.resetData();
        return ResponseEntity.ok(Map.of("message", "Demo data reset successfully"));
    }
}
