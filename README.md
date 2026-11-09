# DocytFlow — AI AP Automation & Continuous Bookkeeping Engine

> A full-stack working prototype of **Docyt's core AI document ingestion, human-in-the-loop review, and continuous general ledger sync engine**, purpose-built to demonstrate product engineering mastery for the **Associate Product Engineer** interview at Docyt.

---

## 🚀 Live Demo & Quick Start

Both services run locally out of the box:

### 1. Backend (Spring Boot 3 / Java 17/21)
```bash
cd backend
./mvnw spring-boot:run    # On Windows: .\mvnw.cmd spring-boot:run
```
* **Port**: `http://localhost:8080`
* **H2 Database Console**: `http://localhost:8080/h2-console` (`JDBC URL: jdbc:h2:mem:docytdb`)

### 2. Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
* **UI**: `http://localhost:5173` (Proxies `/api` $\rightarrow$ `http://localhost:8080`)

---

## 💡 Why This Demonstrates the "Product Engineer" Mindset

A Product Engineer bridges **business domain logic**, **user experience**, and **resilient backend architecture**. In accounting automation, AI cannot just be an afterthought:

1. **The 90% AI Trap**: In consumer apps, 90% accuracy is great. In accounting, a 10% error rate corrupts the trial balance and causes audit failure. That is why Docyt relies on **Confidence Thresholds**—flagging items below 80% confidence for human controller review.
2. **Continuous Close vs. Month-End Crunch**: Traditional accounting waits for the 30th of the month to reconcile bank statements. Docyt continuously categorizes and posts balanced journal entries in real-time.
3. **Idempotency in Financial Sync**: If a network failure occurs while syncing an approved bill to QuickBooks Online, retrying without an **idempotency key** causes duplicate liabilities and overpayment.

---

## 🛠️ Stack Alignment with Docyt

| Docyt Production Stack | Prototype Implementation | Architectural Purpose |
| :--- | :--- | :--- |
| **Backend** | Java 17/21, Spring Boot 3, REST APIs | High-throughput, type-safe accounting microservices |
| **Frontend** | React, TypeScript, Tailwind CSS, Lucide | Split-screen invoice viewer, high-density table, live filters |
| **Database** | PostgreSQL + MongoDB (Emulated via JPA/H2) | Relational integrity for General Ledger; flexible document line items |
| **Async Queues** | Simulated Ingestion Pipeline | Non-blocking token extraction and background categorization |
| **Integrations** | QuickBooks Online Continuous Sync Engine | Auto-generates balanced double-entry Journal Entries |

---

## 🎯 Key Features Demonstrated in the App

### 1. Split-Screen Document Reviewer (The Docyt Hero View)
* **Left**: Interactive invoice voucher with hover bounding box highlights.
* **Right**: Extracted editable fields, confidence score breakdown, Chart of Accounts (COA) auto-suggestion, and line items.

### 2. Anomaly & Duplicate Bill Detection
* Intelligently detects identical invoice numbers or duplicate vendor-amount combinations.
* Flags bills with a warning banner and prevents accidental double-payment.

### 3. Balanced Double-Entry Journal Entry Generation
* When an invoice is approved and synced:
  $$\sum \text{Debits} = \sum \text{Credits}$$
  * **Debit**: Expense Account (e.g., `6080 - Cloud Hosting & SaaS`)
  * **Credit**: `2000 - Accounts Payable` (Liability)
* Generates an **idempotency key** (`QBO-SYNC-...`) and logs the audit event.

### 4. Full Compliance Audit Log
* Tracks every transition: OCR ingestion timestamp, manual controller adjustments, category overrides, approval sign-off, and ledger posting.

### 5. Multi-Entity / Location Filtering
* Switch between `All Entities`, `Docyt HQ - SF`, `Chicago Unit #12`, and `West Coast Sales`—showcasing Docyt’s core multi-unit franchise strength.

---

## 🎤 Interview Pitch Script (How to Present This)

When asked: *"Tell me about yourself"* or *"Why do you want to join Docyt?"*

> *"To genuinely understand Docyt's core value proposition from a Product Engineer's perspective, I built **DocytFlow**—a working prototype of Docyt’s continuous AP ingestion and QuickBooks sync pipeline using Java 17/Spring Boot and React TypeScript.*
> 
> *It helped me deeply understand the product trade-offs Docyt faces every day: why human-in-the-loop review is mandatory when confidence drops below 80%, how idempotency prevents duplicate ledger posting, and how multi-entity franchise architectures need clean segregation between document payloads and immutable general ledger entries.*
> 
> *I have the app running locally right now—would you like to see a quick 2-minute walkthrough?"*
