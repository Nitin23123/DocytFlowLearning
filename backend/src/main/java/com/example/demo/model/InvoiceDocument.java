package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String invoiceNumber;

    @Column(nullable = false)
    private String vendorName;

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private String currency; // "USD"
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    // AI Confidence & Risk Scoring (0 to 100)
    private Integer overallConfidence;
    private Integer vendorConfidence;
    private Integer amountConfidence;
    private Integer dateConfidence;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    // General Ledger (GL) Mapping
    private String glAccountCode; // e.g. "6080"
    private String glAccountName; // e.g. "Cloud Hosting & SaaS"
    
    // Multi-entity / Location support (Docyt signature feature)
    private String entityLocation; // e.g. "Docyt HQ - San Francisco", "Chicago Unit #4"

    private String paymentMethod; // e.g. "Corporate Credit Card", "ACH Direct", "Check"

    @Column(length = 2000)
    private String notes;

    // Document image preview data (SVG/HTML preview or base64/mock URL)
    @Column(length = 4000)
    private String documentPreview;

    private Boolean isDuplicateFlagged;
    private String duplicateReason;

    private Boolean isSynced;
    private String syncTransactionId;
    private LocalDateTime syncedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "USD";
        if (this.isSynced == null) this.isSynced = false;
        if (this.isDuplicateFlagged == null) this.isDuplicateFlagged = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
