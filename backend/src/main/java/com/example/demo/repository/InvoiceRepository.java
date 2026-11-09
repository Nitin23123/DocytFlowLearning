package com.example.demo.repository;

import com.example.demo.model.InvoiceDocument;
import com.example.demo.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceDocument, Long> {
    List<InvoiceDocument> findByStatus(InvoiceStatus status);
    List<InvoiceDocument> findAllByOrderByCreatedAtDesc();
    boolean existsByVendorNameIgnoreCaseAndInvoiceNumberIgnoreCase(String vendorName, String invoiceNumber);
    boolean existsByVendorNameIgnoreCaseAndTotalAmount(String vendorName, BigDecimal totalAmount);
}
