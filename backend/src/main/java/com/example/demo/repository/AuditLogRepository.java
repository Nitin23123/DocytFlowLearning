package com.example.demo.repository;

import com.example.demo.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByInvoiceIdOrderByTimestampDesc(Long invoiceId);
    List<AuditLog> findTop20ByOrderByTimestampDesc();
}
