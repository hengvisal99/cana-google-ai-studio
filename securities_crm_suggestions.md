# 🏦 Securities CRM — Complete System Suggestions for Cambodia

> Based on analysis of the existing codebase: Customer 360, Dashboard, KYC/Onboarding workflow, IPO transactions, Product portfolio (CSX Screen, Client Card, Employee Trading, VIP Customer), SECC Investor ID, Trading Account management, and the CSO → SR → Manager approval chain.

---

## ✅ What You Already Have

| Module | Status |
|---|---|
| Customer Onboarding (KYC) | ✅ Done |
| Individual Profile (EN + KH) | ✅ Done |
| Investor ID (SECC) | ✅ Done |
| Trading Account Info | ✅ Done |
| Customer Type Registry (CSX Screen, Client Card, VIP, IPO, Employee Trading) | ✅ Done |
| Customer 360 View | ✅ Done |
| Workflow: CSO → SR → Manager Approval | ✅ Done |
| Dashboard with Charts (Growth, Risk Profile, Age, IPO) | ✅ Done |
| Document Upload | ✅ Done |
| Close Account workflow | ✅ Done |

---

## 🚀 Suggested Additions — Priority Grouped

---

### 🔴 Priority 1 — Regulatory & Compliance (Must-Have for Cambodia)

#### 1.1 KYC/AML Compliance Engine
Cambodia's SECC and NBC require AML compliance. Add:
- **Sanctions Screening** — check customer against OFAC, UN, local blacklists at onboarding & periodic review
- **PEP Detection** — flag Politically Exposed Persons automatically
- **AML Risk Scoring** — rule-based scoring from occupation, transaction pattern, nationality
- **Periodic KYC Review** — trigger re-KYC at 1-year / 3-year intervals with alerts
- **SAR (Suspicious Activity Report)** — built-in form and submission tracking

> Tie this into the existing `kycStatus` and `riskRating` fields on `Individual`.

#### 1.2 SECC Regulatory Reporting
- **Investor Registration Report** — monthly report to SECC on new registrations
- **Investor ID Expiry Report** — alert before SECC Investor IDs expire (the `investorIdExpiredDate` field already exists)
- **Account Activity Report** — dormant account identification and reporting
- **SECC Submission Tracker** — track `dateSentToSECC` / `dateReceivedFromSECC` per customer

#### 1.3 Document Expiry & Compliance Tracker
- Track `expiredDate` on ID cards for each customer — already stored, needs UI alert
- Bulk view: "Expiring IDs in next 30 / 60 / 90 days"
- Automatic escalation to assigned SR when a document expires

---

### 🟠 Priority 2 — Trading & Portfolio Operations

#### 2.1 Portfolio Holdings Module
- Real-time (or batch-refreshed) view of each customer's holdings on CSX
- Columns: Stock, Quantity, Average Cost, Market Price, P&L, % Change
- Link to the existing `IPOTransactionRecord` and expand it into a full **Trade History** module

#### 2.2 Order Management (Light Version)
- Log buy/sell orders per customer (manual entry or API integration with CSX Core)
- Status: Pending → Filled → Cancelled
- Tie orders to `tradingAccountNumber`

#### 2.3 Dividend & Corporate Action Tracker
- Record dividends received per customer (already partly in `FinancialTransaction.category = 'Dividend'`)
- Corporate actions: stock splits, rights issues, bonus shares
- Auto-update portfolio cost basis

#### 2.4 Settlement Tracker
- T+2 settlement tracking for each trade
- Status: Unsettled → Settled → Failed
- Alerts for failed settlements to the assigned SR

---

### 🟡 Priority 3 — IPO Management (High Value for CSX Market)

#### 3.1 Full IPO Lifecycle Management
Your system already tracks `IPOTransactionRecord`. Expand to:
- **IPO Master Register** — list of all upcoming / active / closed IPOs on CSX
- **Subscription Management** — how many shares each customer applied for, allocation, payment status
- **Refund Tracking** — for oversubscribed IPOs, track refund to customer's bank
- **Allotment Letters** — auto-generate PDF allotment letter per customer

#### 3.2 IPO Eligibility Check
- Verify customer has active Investor ID (`investorIdInfo`) before allowing subscription
- Block subscription if KYC status ≠ verified
- Check VIP customer flag for priority allocation

#### 3.3 IPO Dashboard
Extend your existing dashboard charts with:
- IPO subscription by customer segment (Retail / HNW / Institutional)
- Oversubscription rate per IPO
- Top 10 customers by IPO volume

---

### 🟢 Priority 4 — Sales & Relationship Management

#### 4.1 Sales Pipeline / Lead Management
- Track prospects before they become full customers
- Lead Source: Walk-in, Referral, Online, Event
- Pipeline stages: Contacted → KYC Submitted → Account Opened → Active
- Assign leads to Relationship Managers (SR)

#### 4.2 SR Performance Dashboard
- Per-SR metrics: new accounts opened, AUM (Assets Under Management), IPO subscriptions facilitated
- Target vs. Actual for the month
- Customer churn attributed to each SR

#### 4.3 Communication & Interaction Log
- Log every customer touchpoint: call, meeting, email, LINE message
- Capture: Date, Channel, Summary, Outcome, Next Action
- Reminder/follow-up scheduling
- Extends the existing `AuditTouchpoint` type

#### 4.4 Task & Reminder System
- Assign tasks to CSO / SR / Manager (e.g. "Call VIP customer before IPO closes")
- Due date, priority, status
- Dashboard widget: "My Tasks Today"

---

### 🔵 Priority 5 — Reporting & Analytics

#### 5.1 Operational Reports
| Report | Description |
|---|---|
| New Customer Report | Daily/Monthly new registrations |
| Active Account Report | All active accounts by branch/SR |
| KYC Expiry Report | IDs expiring in X days |
| Investor ID Expiry Report | SECC IDs to renew |
| Product Adoption Report | How many customers have each product type |
| Dormant Account Report | Accounts with no activity in 6+ months |

#### 5.2 Management Reports (C-Level)
- AUM trend over time
- Revenue by product / segment
- Customer lifecycle stage distribution
- Risk rating distribution vs. regulatory thresholds

#### 5.3 Export & Print
- Export any list/report to **Excel** and **PDF**
- Print customer profile as a structured form (useful for branch staff)
- Bulk export for SECC submission

---

### 🟣 Priority 6 — Back Office & Administration

#### 6.1 User & Role Management
- Roles: Admin, Manager, SR (Senior Representative), CSO, Read-Only
- Per-role permission matrix (View / Create / Approve / Export)
- Audit log: who changed what, when

#### 6.2 Master Data Management
Your `lib/master-data.ts` already exists. Extend with UI:
- Manage: Branches, Nationalities, Occupation codes, Bank names
- Manage product types (CSX Screen, Client Card, etc.) without code changes
- Manage SR list / Relationship Managers

#### 6.3 Notification Centre
- In-app notifications for: pending approvals, expiring documents, IPO deadlines
- Email/SMS alerts (integrate SMTP or Twilio)
- Notification preferences per user

#### 6.4 Activity Audit Trail
- Immutable log of all system actions (create, update, approve, reject, delete)
- Searchable by user, date range, entity
- Required for regulatory compliance

---

### ⚫ Priority 7 — Digital & Self-Service (Future Phase)

#### 7.1 Customer Portal (Web)
- Customers can view their own portfolio, transaction history
- Upload documents for KYC renewal
- Apply for IPO subscription online
- Track their own registration/close-account status

#### 7.2 e-KYC Integration
- Camera-based ID capture and OCR (pre-fill forms)
- Face-match liveness check
- Integration with Cambodia's national ID API (when available)

#### 7.3 CSX Market Data Integration
- Pull live stock prices from CSX API
- Show portfolio P&L in real-time
- Market news feed relevant to customer's holdings

---

## 📊 Suggested Roadmap

```
Phase 1 (0–3 months)  — Regulatory Foundation
  ├── KYC/AML Compliance Engine
  ├── Document Expiry Tracker
  ├── SECC Reporting Module
  └── Audit Trail

Phase 2 (3–6 months)  — Trading Operations
  ├── Portfolio Holdings
  ├── IPO Lifecycle Management
  ├── Settlement Tracker
  └── Order History

Phase 3 (6–9 months)  — CRM & Sales
  ├── Lead / Pipeline Management
  ├── SR Performance Dashboard
  ├── Communication Log
  └── Task & Reminder System

Phase 4 (9–12 months) — Reporting & Admin
  ├── Operational & Management Reports
  ├── Role-based Access Control
  ├── Master Data UI
  └── Notification Centre

Phase 5 (12+ months) — Digital Transformation
  ├── Customer Portal
  ├── e-KYC Integration
  └── CSX Live Market Data
```

---

## 🇰🇭 Cambodia-Specific Considerations

| Topic | Recommendation |
|---|---|
| **Language** | Full Khmer (ក្មែរ) UI support — your model already has `surnameKH` / `givenNameKH`, extend to all labels |
| **Currency** | Support KHR (Riel) alongside USD — CSX trades in both |
| **SECC Rules** | Investor ID is mandatory before any trading — enforce in workflow |
| **NBC AML** | Align with National Bank of Cambodia's AML/CFT guidelines (Prakas on AML) |
| **CSX Connectivity** | Plan API integration with Cambodia Securities Exchange (CSX) Core system |
| **Khmer Calendar** | Offer Khmer calendar date display option where appropriate |
| **Offline Mode** | Branch connectivity can be unreliable — consider offline-first PWA for branches |

---

> 💡 **Quick wins to start with:** Investor ID Expiry alerts, Document expiry tracker, SR task reminders, and an Export-to-Excel button on the customer list — all of these leverage data already in your system with minimal new data modeling required.
