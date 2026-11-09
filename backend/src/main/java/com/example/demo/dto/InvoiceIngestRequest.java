package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceIngestRequest {
    private String vendorName;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String entityLocation;
    private String paymentMethod;
    private String sampleType; // e.g. "AWS", "SYSCO", "STAPLES", "CUSTOM"
    private List<LineItemDto> lineItems;

    @Data
    public static class LineItemDto {
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;
    }
}
