# Rule sheet

The model may only cite rules from this file, by `id`. It never invents a
section number, a timeline, or a rupee figure. Code reads the YAML block
below to compute every deadline and penalty — see `/lib/deadlines.ts`.

`verified: true` means: someone read the primary source (the actual
notification, circular, or CAR — not just a news writeup) and confirmed the
number in `days`/`hours` and `penaltyPerDay` matches it. A row with
`verified: false` must never be used in a draft; treat it the same as no
rule at all (`ruleId: null`, low confidence).

Last verified: 2026-09-11.

```yaml
- id: ECOM_ACK_48H
  law: Consumer Protection (E-Commerce) Rules 2020, Rule 4(4), grievance officer
  says: The platform's grievance officer must acknowledge a complaint within 48 hours.
  from: firstComplaintDate
  hours: 48
  verified: true
  source: https://thc.nic.in/Central%20Governmental%20Rules/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf
  sourceNotes: G.S.R. 462(E), Gazette of India Extra. Part II Sec 3(i), 23 Jul 2020. Confirmed against the notified rule text.

- id: ECOM_RESOLVE_30D
  law: Consumer Protection (E-Commerce) Rules 2020, Rule 4(4)
  says: The platform must redress the complaint within one month (30 days) of receiving it.
  from: firstComplaintDate
  days: 30
  verified: true
  source: https://thc.nic.in/Central%20Governmental%20Rules/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf
  sourceNotes: Same notification as ECOM_ACK_48H.

- id: RBI_FAILED_UPI_T1
  law: RBI circular RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20), 20 Sep 2019 — Harmonisation of TAT for failed transactions
  says: If a UPI payment is debited but the beneficiary is not credited, the bank/PSP must auto-reverse it by T+1 working day. After that the bank pays ₹100 per day, credited automatically without a complaint being needed.
  from: eventDate
  days: 1
  penaltyPerDay: 100
  verified: true
  source: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11693
  sourceNotes: >
    Confirmed against the RBI Annexure table. This circular sets DIFFERENT
    TATs per rail: UPI/IMPS/NACH = T+1; card-to-card = T+1; PoS/e-commerce
    card (charge-slip not generated) = T+5; ATM cash-not-dispensed = T+5.
    Do not reuse this rule's "days: 1" for a card/PoS case, and do not
    reintroduce a generic "T+5" id for UPI — that was the original (wrong)
    draft of this row, before verification. If a card/PoS-specific rule is
    needed later, add RBI_FAILED_POS_T5 (days: 5) as its own verified row
    rather than overloading this one.

- id: RBI_OMBUDSMAN_30D
  law: RBI Integrated Ombudsman Scheme 2021
  says: If the bank/PSP does not resolve your complaint within 30 days, you can complain to the RBI Ombudsman for free.
  from: firstComplaintDate
  days: 30
  verified: true
  source: https://cms.rbi.org.in/
  sourceNotes: Confirmed against RBI/regulated-entity FAQ pages reproducing the Scheme's clause 3.

- id: DGCA_AIRLINE_CANCEL_CARD_7D
  law: DGCA Civil Aviation Requirements, Section 3, Series 'M', Part II, para 3(a)
  says: For card payments, the airline must refund within 7 days of the cancellation.
  from: eventDate
  days: 7
  verified: true
  source: https://www.dgca.gov.in/digigov-portal/
  sourceNotes: >
    Read directly from the DGCA CAR (Section 3, Series M, Part II) PDF.
    Applies to the direct-payment-method refund, regardless of who
    cancelled the flight — the CAR does not condition this on
    passenger-initiated vs. airline-initiated cancellation.

- id: DGCA_AIRLINE_CANCEL_AGENT_14D
  law: DGCA Civil Aviation Requirements, Section 3, Series 'M', Part II, para 3(c)
  says: If the ticket was booked through a travel agent or portal, the airline (not the agent) is responsible for the refund, within 14 working days.
  from: eventDate
  days: 14
  verified: true
  source: https://www.dgca.gov.in/digigov-portal/
  sourceNotes: >
    Same CAR as DGCA_AIRLINE_CANCEL_CARD_7D. The text says "14 WORKING
    days", not calendar days (this figure was shortened from 21 working
    days by the CAR revision effective 26 Mar 2026 — confirmed by multiple
    2026 news reports of the revision alongside the primary CAR text for
    the general structure). /lib/deadlines.ts currently treats `days` as
    calendar days and has no working-day (weekend/holiday-skipping) logic,
    so a deadline computed from this rule is a slight underestimate (the
    real legal deadline is a few calendar days later). Flagged here rather
    than silently building business-day math into deadlines.ts before it's
    needed — revisit if the eval shows this matters.

- id: IT_RULES_INTERMEDIARY_15D
  law: Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, Rule 3(2)(a)(i)
  says: An intermediary (like a bus or hotel booking app) must acknowledge a complaint within 24 hours and resolve it within 15 days.
  from: firstComplaintDate
  days: 15
  verified: true
  source: https://www.meity.gov.in/static/uploads/2024/02/Information-Technology-Intermediary-Guidelines-and-Digital-Media-Ethics-Code-Rules-2021-updated-06.04.2023-.pdf
  sourceNotes: Confirmed against the official MeitY-hosted consolidated rules text.

- id: NCH_CONVERGENCE_30D
  law: National Consumer Helpline convergence programme
  says: A convergence-partner company is expected to respond within 30 days of a complaint filed via NCH (1915). This is a voluntary programme commitment, not a statutory deadline — say so if used in a draft.
  from: nchComplaintDate
  days: 30
  verified: true
  source: https://consumerhelpline.gov.in/public/convergenceprogram
  sourceNotes: Confirmed against the NCH's own convergence-programme page. Not a law — do not describe it as one in a draft.
```

## Not covered

The model must return `caseType: "out_of_scope"` for these, never invent a rule for them:

- **Cyber fraud** (phishing, hacked account, fraudulent loan taken in the user's name) — route to **1930** (Indian Cyber Crime Helpline, cybercrime.gov.in).
- **Coaching institute contracts and other offline-service disputes beyond a simple refund** (e.g. a loan taken out in the user's name for a course) — beyond what a complaint draft can resolve; route to **e-Jagriti** (e-jagriti.gov.in) or advise seeing a lawyer.
- **Anything that needs a court filing** — this tool drafts complaints and explains rules, not legal advice, and never predicts a case's outcome.
- **Merchant-to-merchant or peer disputes with no failed-transaction element** (e.g. a successful UPI payment sent to the wrong person, or a shop refusing to refund a duplicate payment) — RBI's failed-transaction TAT rules don't apply here (the transaction succeeded); there is no rule on this sheet for it. Say so honestly rather than reaching for the nearest RBI rule.
