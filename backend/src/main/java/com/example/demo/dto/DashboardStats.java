package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private long totalInvoices;
    private long pendingReviewCount;
    private long lowConfidenceCount;
    private long syncedCount;
    private long duplicateFlaggedCount;
    private BigDecimal totalAccountsPayable;
    private BigDecimal pendingReviewAmount;
    private BigDecimal syncedAmount;
    private double autoCategorizationRate; // percentage
}
