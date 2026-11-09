package com.example.demo.dto;

import com.example.demo.model.InvoiceStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceUpdateRequest {
    private String vendorName;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private String glAccountCode;
    private String glAccountName;
    private String entityLocation;
    private String paymentMethod;
    private String notes;
    private InvoiceStatus status;
    private String userEmail; // For audit log tracking
}
