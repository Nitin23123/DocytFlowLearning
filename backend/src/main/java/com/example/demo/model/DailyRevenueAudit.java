package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "revenue_audits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyRevenueAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entityName; // e.g. "Grand Vista Hotel & Suites"
    private LocalDate auditDate;

    // 1. POS / PMS Gross Sales Breakdown
    private BigDecimal roomRevenue;
    private BigDecimal foodSales;
    private BigDecimal beverageSales;
    private BigDecimal salesTax;
    private BigDecimal grossSalesTotal;

    // 2. Settlement & Payouts Breakdown
    private BigDecimal creditCardSettlement; // Visa / MC
    private BigDecimal amexSettlement;
    private BigDecimal deliveryAppPayouts; // DoorDash / UberEats
    private BigDecimal cashDeposit;
    private BigDecimal merchantProcessorFees;
    private BigDecimal netSettlementTotal;

    // 3. Reconciliation Math
    private BigDecimal variance; // grossSalesTotal - (netSettlementTotal + merchantProcessorFees)
    private Boolean isReconciled;
    private Boolean isSyncedToLedger;
    private String syncTransactionId;
    private LocalDateTime syncedAt;

    private String notes;
}
