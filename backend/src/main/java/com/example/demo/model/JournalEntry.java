package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long invoiceId;
    private String entryNumber; // e.g. "JE-2026-1049"
    private String debitAccount; // e.g. "6080 - Cloud Infrastructure"
    private BigDecimal debitAmount;
    private String creditAccount; // e.g. "2000 - Accounts Payable"
    private BigDecimal creditAmount;
    
    @Column(unique = true)
    private String idempotencyKey; // Prevents duplicate posting in QBO/ERP

    private String targetSystem; // e.g. "QuickBooks Online API (Simulated)"
    private LocalDateTime postedAt;
}
