package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long invoiceId;
    private String action; // OCR_INGESTION, CATEGORY_OVERRIDE, STATUS_CHANGE, LEDGER_SYNC
    private String performedBy; // "AI Extractor Engine", "Nitin (Product Engineer)", "System Rule"
    
    @Column(length = 1000)
    private String details;

    private LocalDateTime timestamp;
}
