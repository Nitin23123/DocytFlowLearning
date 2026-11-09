package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.repository.ChartOfAccountRepository;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final InvoiceRepository invoiceRepository;
    private final ChartOfAccountRepository coaRepository;
    private final AuditLogRepository auditLogRepository;
    private final JournalEntryRepository journalEntryRepository;

    @Override
    public void run(String... args) {
        if (coaRepository.count() == 0) {
            resetData();
        }
    }

    @Transactional
    public void resetData() {
        journalEntryRepository.deleteAll();
        auditLogRepository.deleteAll();
        invoiceRepository.deleteAll();
        coaRepository.deleteAll();

        // 1. Chart of Accounts tailored for Hotels, Restaurants, and Franchises
        coaRepository.saveAll(List.of(
                ChartOfAccount.builder().code("5010").name("Cost of Goods Sold - Food & Beverage").category("Cost of Goods Sold").defaultDescription("Sysco, US Foods, Meat, Seafood, Produce").build(),
                ChartOfAccount.builder().code("6150").name("Guest Linen & Commercial Laundry").category("Operating Expense").defaultDescription("Ecolab, Cintas, Laundry Chemicals & Linens").build(),
                ChartOfAccount.builder().code("6080").name("Hotel PMS & Restaurant POS Software").category("Operating Expense").defaultDescription("Oracle Opera PMS, Toast POS, Cloudbeds").build(),
                ChartOfAccount.builder().code("6120").name("Hotel Utilities (Electric, Water, Gas)").category("Operating Expense").defaultDescription("Commercial HVAC Power, Water, Waste Management").build(),
                ChartOfAccount.builder().code("6040").name("Property Lease & Franchise Fees").category("Operating Expense").defaultDescription("Hotel Franchise Royalty, Real Estate Lease").build(),
                ChartOfAccount.builder().code("6050").name("Guest Room Amenities & Supplies").category("Operating Expense").defaultDescription("Soaps, Toiletries, Keycards, Front Desk Paper").build(),
                ChartOfAccount.builder().code("6100").name("Staff Travel & Hospitality Events").category("Operating Expense").defaultDescription("Hotel GM travel, hospitality conferences").build(),
                ChartOfAccount.builder().code("2000").name("Accounts Payable").category("Current Liability").defaultDescription("Unpaid vendor bills and supplier invoices").build()
        ));

        // 2. Bill 1: Ecolab (Grand Vista Hotel - Ready for Review)
        InvoiceDocument inv1 = InvoiceDocument.builder()
                .invoiceNumber("ECO-2026-8819")
                .vendorName("Ecolab Commercial Laundry & Sanitation")
                .invoiceDate(LocalDate.now().minusDays(2))
                .dueDate(LocalDate.now().plusDays(28))
                .subtotal(new BigDecimal("1700.00"))
                .taxAmount(new BigDecimal("142.50"))
                .totalAmount(new BigDecimal("1842.50"))
                .overallConfidence(97)
                .vendorConfidence(99)
                .amountConfidence(98)
                .dateConfidence(96)
                .status(InvoiceStatus.PENDING_REVIEW)
                .glAccountCode("6150")
                .glAccountName("Guest Linen & Commercial Laundry")
                .entityLocation("Grand Vista Hotel & Suites (140 Rooms)")
                .paymentMethod("Corporate Amex (...4012)")
                .notes("Monthly laundry chemical drums and linen sanitation for 140 guest rooms.")
                .isDuplicateFlagged(false)
                .isSynced(false)
                .build();

        inv1.getLineItems().add(InvoiceLineItem.builder().invoice(inv1).description("Solid Brilliance Commercial Laundry Detergent (4x5gal)").quantity(4).unitPrice(new BigDecimal("280.00")).amount(new BigDecimal("1120.00")).suggestedCategory("Laundry Expense").build());
        inv1.getLineItems().add(InvoiceLineItem.builder().invoice(inv1).description("Oasis Disinfectant Room Cleaner Drum").quantity(2).unitPrice(new BigDecimal("290.00")).amount(new BigDecimal("580.00")).suggestedCategory("Housekeeping Supplies").build());
        InvoiceDocument saved1 = invoiceRepository.save(inv1);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved1.getId())
                .action("INVOICE_IMPORTED")
                .performedBy("Docyt Auto-Capture")
                .details("Extracted from Ecolab electronic bill. Auto-categorized to 6150 Guest Linen & Laundry.")
                .timestamp(LocalDateTime.now().minusDays(2))
                .build());

        // 3. Bill 2: Sysco Foods (The Harbor Bistro - Duplicate Alert Test)
        InvoiceDocument inv2 = InvoiceDocument.builder()
                .invoiceNumber("SYS-882194-A")
                .vendorName("Sysco Food Services")
                .invoiceDate(LocalDate.now().minusDays(4))
                .dueDate(LocalDate.now().plusDays(10))
                .subtotal(new BigDecimal("3200.00"))
                .taxAmount(new BigDecimal("220.00"))
                .totalAmount(new BigDecimal("3420.00"))
                .overallConfidence(42)
                .vendorConfidence(95)
                .amountConfidence(88)
                .dateConfidence(40)
                .status(InvoiceStatus.FLAGGED_DUPLICATE)
                .glAccountCode("5010")
                .glAccountName("Cost of Goods Sold - Food & Beverage")
                .entityLocation("The Harbor Bistro & Lounge")
                .paymentMethod("ACH Direct")
                .notes("Duplicate Warning: An invoice with number SYS-882194-A was already recorded on 2026-11-03.")
                .isDuplicateFlagged(true)
                .duplicateReason("Potential Duplicate: Matching invoice #SYS-882194-A already exists in ledger.")
                .isSynced(false)
                .build();

        inv2.getLineItems().add(InvoiceLineItem.builder().invoice(inv2).description("Choice Angus Beef Prime Rib Cases").quantity(4).unitPrice(new BigDecimal("550.00")).amount(new BigDecimal("2200.00")).suggestedCategory("COGS Food").build());
        inv2.getLineItems().add(InvoiceLineItem.builder().invoice(inv2).description("Fresh Atlantic Salmon Fillets & Produce").quantity(1).unitPrice(new BigDecimal("1000.00")).amount(new BigDecimal("1000.00")).suggestedCategory("COGS Food").build());
        InvoiceDocument saved2 = invoiceRepository.save(inv2);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved2.getId())
                .action("DUPLICATE_FLAGGED")
                .performedBy("Docyt Fraud Prevention")
                .details("Duplicate invoice #SYS-882194-A detected. Flagged to prevent double payment to Sysco.")
                .timestamp(LocalDateTime.now().minusDays(4))
                .build());

        // 4. Bill 3: Oracle Opera PMS (Grand Vista Hotel - Synced to QBO!)
        InvoiceDocument inv3 = InvoiceDocument.builder()
                .invoiceNumber("ORA-PMS-94021")
                .vendorName("Oracle Hospitality (Opera PMS)")
                .invoiceDate(LocalDate.now().minusDays(6))
                .dueDate(LocalDate.now().minusDays(1))
                .subtotal(new BigDecimal("850.00"))
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("850.00"))
                .overallConfidence(99)
                .vendorConfidence(99)
                .amountConfidence(99)
                .dateConfidence(99)
                .status(InvoiceStatus.SYNCED_TO_LEDGER)
                .glAccountCode("6080")
                .glAccountName("Hotel PMS & Restaurant POS Software")
                .entityLocation("Grand Vista Hotel & Suites (140 Rooms)")
                .paymentMethod("Corporate Visa (...9910)")
                .notes("Opera Cloud Property Management System monthly subscription (140 hotel rooms).")
                .isDuplicateFlagged(false)
                .isSynced(true)
                .syncTransactionId("JE-2026-1003")
                .syncedAt(LocalDateTime.now().minusDays(1))
                .build();

        inv3.getLineItems().add(InvoiceLineItem.builder().invoice(inv3).description("Opera Cloud PMS Monthly License - 140 Rooms").quantity(1).unitPrice(new BigDecimal("850.00")).amount(new BigDecimal("850.00")).suggestedCategory("Hotel Tech").build());
        InvoiceDocument saved3 = invoiceRepository.save(inv3);

        JournalEntry je = JournalEntry.builder()
                .invoiceId(saved3.getId())
                .entryNumber("JE-2026-1003")
                .debitAccount("6080 - Hotel PMS & Restaurant POS Software")
                .debitAmount(new BigDecimal("850.00"))
                .creditAccount("2000 - Accounts Payable")
                .creditAmount(new BigDecimal("850.00"))
                .idempotencyKey("QBO-SYNC-INITIAL-HOTEL-PMS")
                .targetSystem("QuickBooks Online API (Continuous Close)")
                .postedAt(LocalDateTime.now().minusDays(1))
                .build();
        journalEntryRepository.save(je);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved3.getId())
                .action("POSTED_TO_LEDGER")
                .performedBy("Docyt Continuous Sync")
                .details("Synced to QuickBooks Online. Balanced journal entry JE-2026-1003 posted.")
                .timestamp(LocalDateTime.now().minusDays(1))
                .build());

        // 5. Bill 4: Pacific Gas & Electric (PG&E Utilities - Approved)
        InvoiceDocument inv4 = InvoiceDocument.builder()
                .invoiceNumber("PGE-4109820-UT")
                .vendorName("Pacific Gas & Electric (PG&E)")
                .invoiceDate(LocalDate.now().minusDays(3))
                .dueDate(LocalDate.now().plusDays(15))
                .subtotal(new BigDecimal("2250.00"))
                .taxAmount(new BigDecimal("160.80"))
                .totalAmount(new BigDecimal("2410.80"))
                .overallConfidence(98)
                .vendorConfidence(99)
                .amountConfidence(98)
                .dateConfidence(97)
                .status(InvoiceStatus.APPROVED)
                .glAccountCode("6120")
                .glAccountName("Hotel Utilities (Electric, Water, Gas)")
                .entityLocation("Grand Vista Hotel & Suites (140 Rooms)")
                .paymentMethod("ACH Direct")
                .notes("Hotel central HVAC chiller power & commercial hot water boiler usage.")
                .isDuplicateFlagged(false)
                .isSynced(false)
                .build();

        inv4.getLineItems().add(InvoiceLineItem.builder().invoice(inv4).description("Commercial Electric Consumption - Hotel Tower").quantity(1).unitPrice(new BigDecimal("1650.00")).amount(new BigDecimal("1650.00")).suggestedCategory("Utilities").build());
        inv4.getLineItems().add(InvoiceLineItem.builder().invoice(inv4).description("Commercial Natural Gas - Guest Water Boilers").quantity(1).unitPrice(new BigDecimal("600.00")).amount(new BigDecimal("600.00")).suggestedCategory("Utilities").build());
        InvoiceDocument saved4 = invoiceRepository.save(inv4);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved4.getId())
                .action("INVOICE_APPROVED")
                .performedBy("Marcus Vance (Hotel General Manager)")
                .details("Approved for monthly utility settlement.")
                .timestamp(LocalDateTime.now().minusHours(5))
                .build());

        // 6. Bill 5: Guest Amenities & Toiletries (Needs Attention)
        InvoiceDocument inv5 = InvoiceDocument.builder()
                .invoiceNumber("GUEST-SUPPLY-4109")
                .vendorName("Guest Supply Co. (Hotel Toiletries)")
                .invoiceDate(LocalDate.now().minusDays(1))
                .dueDate(LocalDate.now().plusDays(20))
                .subtotal(new BigDecimal("310.00"))
                .taxAmount(new BigDecimal("30.20"))
                .totalAmount(new BigDecimal("340.20"))
                .overallConfidence(68)
                .vendorConfidence(85)
                .amountConfidence(62)
                .dateConfidence(65)
                .status(InvoiceStatus.NEEDS_ATTENTION)
                .glAccountCode("6050")
                .glAccountName("Guest Room Amenities & Supplies")
                .entityLocation("Grand Vista Hotel & Suites (140 Rooms)")
                .paymentMethod("Corporate Visa (...9910)")
                .notes("Delivery receipt for room mini-shampoos, soaps, and keycards. Faint sales tax line.")
                .isDuplicateFlagged(false)
                .isSynced(false)
                .build();

        inv5.getLineItems().add(InvoiceLineItem.builder().invoice(inv5).description("Eco-Botanics Hotel Shampoo & Conditioner Cartons (500 units)").quantity(2).unitPrice(new BigDecimal("120.00")).amount(new BigDecimal("240.00")).suggestedCategory("Room Amenities").build());
        inv5.getLineItems().add(InvoiceLineItem.builder().invoice(inv5).description("RFID Hotel Room Keycard Pack (250 count)").quantity(1).unitPrice(new BigDecimal("70.00")).amount(new BigDecimal("70.00")).suggestedCategory("Front Desk Supplies").build());
        InvoiceDocument saved5 = invoiceRepository.save(inv5);

        auditLogRepository.save(AuditLog.builder()
                .invoiceId(saved5.getId())
                .action("LOW_CONFIDENCE_FLAG")
                .performedBy("Docyt Auto-Capture")
                .details("Faint tax line detected. Routed to General Manager review queue.")
                .timestamp(LocalDateTime.now().minusDays(1))
                .build());
    }
}
