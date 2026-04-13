# Loan website: original design vs current build

**Purpose:** Record how the live application compares to the first design (`Loaning Website.pdf`, 7 pages) for supervisor review.

**Date:** April 2026

---

## 1. Overall conclusion

**The build is still largely aligned with the original design in structure, user journeys, and page intent.** Branding evolved (name and logo), some navigation was expanded for a real product (loan types, apply flow), and several areas use **live data** instead of static mock numbers. A few PDF items are **not implemented as separate pages** (e.g. standalone About / FAQ / Help Centre) or are **simplified** (footer contact form).

---

## 2. Branding and global layout

| Design (PDF) | Current implementation | Relevant? |
|--------------|------------------------|-----------|
| “LOAN” + “financialy Health” | **AUNTY D** + **Financial Health** (spelling corrected); logo mark **AD** | **Evolved** — same idea (loan + financial health), stronger identity |
| Header: Home, About, Contact, Login, Sign Up | Home, Loan Types, Apply, Contact (+ auth); **no dedicated “About” route** | **Partially** — core links present; “About” content not a separate page |
| Footer: Write Us, Company, Services, Help Centre | Footer with **Write Us** block and link groups; **no full Help Centre / FAQ pages** | **Partially** — structure similar; deep pages optional in PDF (placeholders) |

---

## 3. Home page

| Design | Implementation | Notes |
|--------|----------------|-------|
| Hero: “Let’s Pay for that Vacation” | **Same headline** on `Index.tsx` | Aligned |
| Stats row (e.g. clients, satisfaction, experience, total loaned) | **Four stat cards** fed by **`/loan/stats`** when available (clients, active loans, applications, total loaned in **N$**) | **Concept aligned** — numbers are **dynamic**, not fixed “18K / 87% / 5 yrs / 80k” |
| “Learn more” | Button scrolls to **How it works** | Aligned |
| “Why choose Us” + three pillars | Section present with **Certified experts**, **Personalised Loan Solutions**, **Active All Year** | Aligned (copy refined, not Lorem-only) |
| How it works + “Learn more” | Present | Aligned |
| Find Office / Finder | **“Get directions”** opens Google Maps using configurable office address | Aligned (implementation detail differs) |

---

## 4. Authenticated experience (design slides 2 & 4)

| Design | Implementation | Notes |
|--------|----------------|-------|
| User area: name, email, General, Edit profile, Loan Status, Account Details, History, **Documents** | **Profile** hub with paths to account details, edit profile, loan status, history; documents tied to **apply / profile** flow | **Largely aligned** — same tasks; **not** a single mega-dropdown identical to mock |
| Documents: Id, PaySlip, Bank Statement, Proof of Residence | Supported in **apply** flow / uploads as per backend | Aligned in intent |

---

## 5. Loan Types (design slide 3)

| Design | Implementation | Notes |
|--------|----------------|-------|
| Cards: 1 / 3 / 5 month periods, “Apply Now”, Lorem text | **`/loan-types`** with periods and apply CTAs | Aligned; marketing copy can replace placeholder text |

---

## 6. Loan application (design slide 4)

| Design sections | Implementation (`Apply.tsx` + API) | Notes |
|-----------------|-------------------------------------|-------|
| Personal info, employment, bank, guarantors, documents, Submit | **Multi-step apply** with matching field groups | Strong alignment |
| Progress / sections | Step-based UI | Aligned |

---

## 7. Loan Status (design slide 5)

| Design | Implementation | Notes |
|--------|----------------|-------|
| Reference, name, amount, date applied | Shown on **`/loan-status`** | Aligned |
| Statuses: Rejected, Approved, Pending, Payback Ongoing, Complete, Money Sent | Same **status vocabulary** in UI | Aligned |
| Loan details: interest, repayment, installment, next payment | Present when API returns data | Aligned |
| Messages from lender | **Messages** section | Aligned |

---

## 8. Auth (design slides 6–7)

| Design | Implementation | Notes |
|--------|----------------|-------|
| Sign Up: name, surname, email, password | **`/signup`** | Aligned |
| Login: email, password | **`/login`** | Aligned |
| Email verification (later product decision) | Optional / configurable on backend | **Extension** beyond static PDF |

---

## 9. Gaps and intentional differences

1. **No standalone `/about`** — PDF suggested an About entry; content may live on Home or can be added later.
2. **Footer “FAQ” / “Help Centre”** — not built as dedicated routes; can be added if required.
3. **Hero statistics** — design showed **marketing numbers**; product uses **real aggregates** from the backend when available.
4. **Admin dashboard** — not in the PDF; added for operations (loan review, decisions). Does not conflict with customer-facing design.
5. **Branding** — from generic “LOAN” to **AUNTY D**; still matches the “financial health + loans” positioning.

---

## 10. Summary for stakeholders

| Area | Relevance to original design |
|------|--------------------------------|
| Information architecture (home → types → apply → status → profile) | **High** |
| Visual story (hero, why us, how it works, office finder) | **High** |
| Auth and sign-up fields | **High** |
| Loan status model | **High** |
| Exact pixel layout / every footer link | **Medium** — same intent, some routes consolidated or deferred |
| Static marketing numbers on home | **Replaced** by dynamic stats where appropriate |

**Verdict:** The first design remains **relevant as the blueprint** for what was built. Deviations are mainly **branding**, **dynamic data**, **extra admin tooling**, and **a few optional pages** not yet implemented as separate URLs.

---

*This document refers to the PDF titled “Loaning Website.pdf” and the codebase under `frontend/` (customer app) and `backend/` (API).*
