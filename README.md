# DocytFlow — Accounts Payable Automation & Continuous Close Engine

An end-to-end financial operations platform that automates vendor invoice capture, General Ledger (GL) categorization, duplicate anomaly detection, and continuous bookkeeping synchronization for **hotels, restaurants, retail businesses, and multi-unit franchises**.

Built with a high-throughput **Java 17 / Spring Boot 3** backend and a high-precision **React 19 / TypeScript** Master-Detail workstation.

---

## 📌 Problem & Motivation

Multi-unit operators (such as a 140-room hotel or a restaurant chain) process hundreds of transactions every week:
* Food and beverage shipments from broadline distributors (e.g., Sysco, US Foods)
* Recurring commercial sanitation and guest linen laundry services (e.g., Ecolab, Cintas)
* Heavy commercial utilities (HVAC power, water boilers)
* Core software subscriptions (Property Management Systems, Point-of-Sale terminals)

Traditional bookkeeping relies on slow, batched month-end closes where controllers spend days manually coding bills into QuickBooks. **DocytFlow** introduces a **continuous close pipeline**: documents are ingested, verified against historical bills for duplicate errors, coded to the Chart of Accounts, and posted with balanced double-entry journal entries in real time.

---

## ✨ Key Features

### 1. Master-Detail Accounting Workstation
* **Queue Navigation (Left):** Real-time bill feed with search, category filtering, and status badges (`Pending`, `Approved`, `Synced`, `Flagged Duplicate`).
* **Active Workstation (Right):** Fluid side-by-side bill inspection with zero modal lag. Review line items, adjust GL account assignments, and monitor audit events in-place.

### 2. Multi-Entity Franchise Architecture
* Supports corporate consolidated reporting alongside segregated ledgers for distinct business units:
  * `Grand Vista Hotel & Suites (140 Rooms)`
  * `The Harbor Bistro & Lounge (Restaurant)`
  * `Metro Retail Boutique #104`

### 3. Anomaly & Duplicate Bill Prevention
* Evaluates incoming supplier bills against existing ledger records.
* Automatically flags matching invoice numbers or vendor/amount collisions (e.g., duplicate Sysco food shipments) to prevent double payments before checks or ACH transfers are initiated.

### 4. Balanced Double-Entry Journal Generator
* Maintains strict accounting invariants:
  $$\sum \text{Debits} = \sum \text{Credits}$$
* Automatically generates balanced ledger records upon approval:
  * **Debit:** Operating Expense account (e.g., `6150 Guest Linen & Commercial Laundry`)
  * **Credit:** `2000 Accounts Payable` (Liability)
* Generates an immutable **Idempotency Key** (`QBO-SYNC-...`) on every transaction to prevent network retries from causing duplicate postings in external ERPs (like QuickBooks Online).

### 5. Compliance Audit Trail
* Logs every state mutation—from initial document capture and automated GL suggestions to manual controller overrides, approvals, and ledger sync events.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + TypeScript                │
│       Master-Detail Workstation (Tailwind CSS, Vite)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (/api/invoices)
┌───────────────────────────▼────────────────────────────┐
│                  Spring Boot 3 (Java 17/21)            │
│  - Document Ingestion & GL Categorization Service      │
│  - Duplicate & Anomaly Detection Rules Engine          │
│  - Continuous Close Double-Entry Generator             │
│  - Immutable Audit Logging Service                     │
└───────────────────────────┬────────────────────────────┘
                            │ JPA / Hibernate
┌───────────────────────────▼────────────────────────────┐
│             H2 Database (PostgreSQL Emulation)         │
│  - Chart of Accounts  - Invoices  - Journal Entries   │
└────────────────────────────────────────────────────────┘
```

| Layer | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Backend** | Java 17/21, Spring Boot 3, Spring Data JPA, Lombok | Type-safe business domain logic, financial integrity, ACID transaction boundaries |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide | High-density keyboard-friendly workstation, responsive master-detail layout |
| **Persistence** | H2 (PostgreSQL Dialect) / Hibernate ORM | Relational General Ledger storage, Chart of Accounts, Journal Entries, Audit Trail |
| **Integrations** | QuickBooks Online Continuous Sync Engine (Simulated) | Idempotent journal entry generation, external sync transaction mapping |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java 17+** (OpenJDK 17 or 21)
* **Node.js 18+** & **npm**

### 1. Run the Backend (Spring Boot)
The project includes the Maven Wrapper (`mvnw`), so no standalone Maven installation is required:

```bash
cd backend

# On macOS / Linux:
./mvnw spring-boot:run

# On Windows:
.\mvnw.cmd spring-boot:run
```

* **API Base URL:** `http://localhost:8080/api/invoices`
* **H2 Database Console:** `http://localhost:8080/h2-console`
  * **JDBC URL:** `jdbc:h2:mem:docytdb`
  * **Username:** `sa`
  * **Password:** *(empty)*

### 2. Run the Frontend (React + Vite)
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

* **Web UI:** `http://localhost:5173`
* *(Vite automatically proxies `/api` requests to `http://localhost:8080`)*

---

## 📂 Project Structure

```
DocytFlowLearning/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── config/          # DataInitializer (Seeds realistic hotel & restaurant bills)
│   │   ├── controller/      # REST API endpoints (/api/invoices)
│   │   ├── dto/             # Request & response payloads
│   │   ├── model/           # JPA entities (InvoiceDocument, JournalEntry, ChartOfAccount, AuditLog)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   └── service/         # GL mapping, duplicate detection, and ledger sync services
│   └── pom.xml              # Maven configuration & dependencies
│
└── frontend/
    ├── src/
    │   ├── components/      # Workstation components (QueueList, DetailWorkstation, Header, Modals)
    │   ├── services/        # API client layer
    │   ├── types/           # TypeScript domain definitions
    │   ├── App.tsx          # Master-Detail layout container
    │   └── main.tsx         # Application root
    └── vite.config.ts       # Vite bundler & reverse proxy configuration
```

---

## 📊 REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/invoices` | List all invoices with current review and sync status |
| `GET` | `/api/invoices/{id}` | Retrieve specific invoice with line items and coding |
| `PUT` | `/api/invoices/{id}` | Update vendor, amount, GL account code, or internal notes |
| `POST` | `/api/invoices/{id}/approve` | Mark invoice as approved for ledger posting |
| `POST` | `/api/invoices/{id}/sync` | Post balanced Double-Entry Journal Entry with idempotency key |
| `POST` | `/api/invoices/ingest` | Ingest new document and trigger automated GL classification |
| `GET` | `/api/invoices/stats` | Retrieve aggregate metrics (Total AP, Pending Review, Synced totals) |
| `GET` | `/api/invoices/accounts` | Retrieve active Chart of Accounts (COA) |
| `GET` | `/api/invoices/{id}/audit` | Retrieve complete audit trail history for an invoice |
| `GET` | `/api/invoices/{id}/journal-entry` | View posted QuickBooks General Ledger journal entry |
| `POST` | `/api/invoices/reset-demo` | Reset database to clean pre-seeded baseline state |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
