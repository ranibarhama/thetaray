# Studio Next — a third concept for Ray Studio

> Built **alongside** v3. Nothing in the existing prototype is removed or changed.
> New tab in the app: **Studio next**. The current Studio stays exactly where it is.

---

## Why a third concept

v70 and v3 are closer to each other than they look. Both are **a chat column next to an
artifact you must read and edit** — v70 calls the artifact a canvas and wraps it in a wizard,
v3 calls it a playbook and wraps it in four stages. In both, the user's job is to *build a
thing*, and the chat is a faster way to type into it.

The team's own briefing already says where this ends up:

| Briefing slide | Quote |
|---|---|
| The vision | "**Trusted analyst** — You: supervise, see only what needs a person. Ray: proposes, runs and improves." |
| Friction to remove | "Re-reading every version after each comment", "waiting between results and suggestions", "**documents nobody edits**", "running tuning rounds by hand" |
| Design value 4 | "**Sign, don't operate.** Ray does the work. A person approves only where it counts." |

v3 removed *some* of that friction. It did not remove the document, the versions to re-read,
or the rounds. Studio next removes all three.

**Thesis: you do not build Ray. You supervise Ray.**

---

## The four inversions

| | v70 / v3 | Studio next |
|---|---|---|
| **1. First minute** | Describe the job → wait → read a draft playbook | Say the job → **Ray is already deciding real alerts in front of you** |
| **2. How you teach** | Edit steps in a document, or tell the chat to edit them | **Correct a real decision.** Each correction becomes a rule, with one tap to say how far it generalises |
| **3. What Ray knows** | A playbook document you read and sign | **A living memory** — plain-English rules, each with the alert that taught it, a confidence bar and an on/off switch. The playbook, flow, MRM doc and analyst guide are *generated exports* |
| **4. Progress** | Four stages you walk through | **One authority dial.** Notches unlock only when the evidence earns them; the stages survive as earned badges |

---

## The surface

```
┌─────────────────────────────────────────────────────────────┐
│  Ray · UK Transaction Screening        [authority dial ▓▓░░] │   ← one permanent header
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│   RAY AT WORK                    │   NEEDS A PERSON   (3)   │
│   live stream of what Ray is     │   one card at a time,    │
│   doing, as living cards that    │   keyboard: ✓ / ✗ / ?    │
│   update in place                │                          │
│                                  │   ─────────────────────  │
│   ▸ A-31877 · escalated   why?   │   RAY'S MEMORY     (24)  │
│   ▸ A-31878 · closed      why?   │   what it learned, from  │
│   ▸ 1,284 closed today           │   which alert, and how   │
│                                  │   sure it is             │
├──────────────────────────────────┴──────────────────────────┤
│  ⌘K  Ask Ray anything — or just speak                   🎙  │   ← one bar, everywhere
└─────────────────────────────────────────────────────────────┘
```

Three things, never more: **what Ray is doing**, **what needs you**, **what Ray knows**.
No wizard, no stage bar to walk, no document to open before you can act.

---

## The mechanics

1. **One-line hire.** Type or speak the job (or pick one of the 24 Ray already knows). Ray
   starts on a real closed alert within seconds and narrates the first decision. Policy, report
   layout and practice data can be attached at any time from the memory — never as a gate up front.

2. **The coach loop.** Every decision Ray shows has three answers: **agree**, **correct**, or
   **ask why**. A correction immediately offers how far it travels — *just this alert · every
   alert like this · ask me next time* — and that becomes a rule in the memory. This is teaching
   by demonstration, the oldest and most usable form of end-user programming, and the thing no
   compliance lead needs training for.

3. **The queue.** Everything needing a person — Ray's own proposals, a colleague's comment, a
   signature, a technical blocker — arrives in one queue, one card at a time, answerable from the
   keyboard. Tuning rounds stop being an event you run; they are just the queue draining.

4. **The authority dial.** Five notches: *watch · suggest · act with my approval · act alone on
   low risk · act alone.* Each locked notch states what would unlock it ("1 more practice round
   at 90%", "two senior signatures"). Moving the dial is the only "stage change" there is, and it
   is reversible in one click, with the rollback recorded.

5. **The memory.** Searchable rules in plain English, each showing the alert that taught it, who
   decided, when, and how confident Ray is. Toggle one off and Ray re-decides the affected alerts
   in front of you. Exports — playbook, flow diagram, model risk document, analyst guide — are
   generated from it on demand, and that is where signing happens.

6. **Quiet by default.** When nothing needs a person, the screen says so and shows the day in one
   line. Ray pings only on the risk-tiered gates.

---

## Nothing is lost

Every capability of v3 has a home here (full mapping kept in the build notes): templates and
disambiguation → the hire bar; policy documents and report layout → memory sources; per-step
editing of owner / deadline / who decides → editing a rule; the flow diagram with inspector and
full screen → a generated export; practice rounds, agreement and suggestions → the coach loop and
the queue; shadow run → the dial's "act with my approval" notch running on live alerts; checklist,
sign-offs, go-live, rollback → the dial's gates; comments, handover, copy, audit trail → queue
items and memory provenance; "Is Ray ready?" and "Where am I?" → the ask bar and the dial itself.

## Why it is better for the demo

- It shows the **end state the briefing promised**, not an intermediate wizard.
- A viewer understands it in one sentence: *Ray works; you coach it; it earns authority.*
- Every claim is evidenced on the customer's own alerts, which is design value 3 verbatim.
- It is the only one of the three concepts where the user never reads a document to make Ray work.
