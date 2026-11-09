package com.example.demo.repository;

import com.example.demo.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    Optional<JournalEntry> findByInvoiceId(Long invoiceId);
    Optional<JournalEntry> findByIdempotencyKey(String idempotencyKey);
}
