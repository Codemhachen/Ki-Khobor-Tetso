# Ateam Chatbot — Data Repository

This repository holds the **data layer** for the Ateam Chatbot, a campus assistant for Tetso College (Dimapur, Nagaland). Each JSON file is one knowledge category the chatbot can query.

> **Status:** Data values are placeholder. Names, phone numbers, prices, room numbers, and dates will be replaced with real values during production rollout. The schema, however, is stable — build against it.

---

## Shared envelope

Every file uses the same outer shape:

```json
{
  "category": "<category_name>",
  "version": 1,
  "type": "knowledge" | "record",
  "entries":  [ ... ]   // present when type === "knowledge"
  "records":  [ ... ]   // present when type === "record"
}
```

- `type` tells you which array key to read (`entries` or `records`). Never both.
- Every item (entry or record) has an `id` (string, file-unique) and a `keywords[]` array of trigger phrases. Use `keywords[]` for intent matching against a user's query.

---

## The two item shapes

### KNOWLEDGE files (Q&A pairs)

Use these for intent-based responses — match the user query against `keywords[]`, then return the `answer`.

| File | Covers |
|---|---|
| `campus_rules.json` | Attendance, dress code, ragging policy, library, phone rules |
| `student_questions.json` | Hostel, fees, Wi-Fi, transcripts, leave applications |
| `senior_mentor.json` | Senior advice — exam prep, internships, backlogs |
| `exam_and_attendance_survival_tips.json` | Practical exam-day and attendance-recovery tips |
| `faqs.json` | Chatbot meta + general campus info (address, calendar, lost & found) |

**Entry shape:**
```json
{
  "id": "rule-001",
  "intent": "attendance_minimum",
  "keywords": ["attendance", "75%", "shortage"],
  "question": "What is the minimum attendance required at Tetso College?",
  "answer": "Students must maintain at least 75% attendance..."
}
```

### RECORD files (structured data)

Use these for lookups by field, not Q&A. Filter on the structured fields, not on `keywords[]`.

| File | Each record is one... |
|---|---|
| `timetable.json` | day's schedule for one program/semester/section |
| `faculty_contacts.json` | faculty member |
| `exam_dates.json` | exam |
| `assignment_reminders.json` | assignment |
| `clubs_and_activities.json` | club / society |
| `affordable_food_options.json` | menu item |
| `cafe_analysis.json` | cafe |
| `direct_order_system.json` | orderable item |
| `student_delivery_partner_system.json` | student delivery partner |

**Common to every record:** `id`, `keywords[]`. Remaining fields vary by file — open any file and read the first record to see its full shape. The shapes are stable and consistent within each file.

---

## Example consumption patterns

Generic JS, framework-agnostic. Load once, query in memory.

**Filter records by fields**
```js
const res = await fetch('/data/timetable.json');
const { records } = await res.json();

const mondayBCA3 = records.filter(r =>
  r.program === 'BCA' && r.semester === 3 && r.day === 'Monday'
);
```

**Keyword search (works for both file types)**
```js
function search(query, data) {
  const q = query.toLowerCase();
  const items = data.entries ?? data.records;
  return items.filter(item =>
    item.keywords.some(k => q.includes(k.toLowerCase()))
  );
}
```

**Distinguish file type at runtime**
```js
const isKnowledge = data.type === 'knowledge';
const items = isKnowledge ? data.entries : data.records;
```

---

## Conventions

- **Dates:** ISO 8601 — `YYYY-MM-DD` (e.g. `2026-11-15`).
- **Times:** 24-hour `HH:MM` (e.g. `09:30`). Ranges use a hyphen — `10:00-12:00`.
- **Currency:** values stored as plain numbers (e.g. `"price": 70`) representing Indian rupees. Rendering the ₹ symbol is the UI's job.
- **JSON:** double quotes only, no trailing commas, no comments. Standard parser-safe JSON.
- **IDs:** short prefixes per file (`rule-`, `sq-`, `tt-`, `fac-`, `ex-`, `as-`, `cl-`, `af-`, `ca-`, `do-`, `dp-`, `sm-`, `tip-`, `faq-`). New IDs follow the same prefix.

---

## Update workflow

Data files are maintained by the backend owner.

1. **Request a change:** open a GitHub issue describing what needs to change in which file.
2. **Backend owner edits locally**, then re-uploads the changed file(s) via GitHub's web UI.
3. **Frontend pulls** the latest to pick up changes. The schema is versioned (`version: 1`) — if it ever needs a breaking change, that number will increment and this README will document the migration.

---

## What's NOT in this repo (yet)

This repo is intentionally **data-only**. There is no API server, no chatbot logic, and no Next.js code here. The frontend is expected to fetch these JSON files directly (or proxy them through its own server). When/if a backend service is added, it will live in a separate repo and this README will link to it.
