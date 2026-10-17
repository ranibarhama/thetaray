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

**One card at a time. Nothing else on screen.**

```
┌──────────────────────────────────────────────────────────┐
│ ← Transaction Screening UK ●     7 taught ▓▓░░ Suggest ⋯ │  ← the only chrome
├──────────────────────────────────────────────────────────┤
│                                                          │
│            ┌────────────────────────────┐                │
│            │ A-31871            $910,000│                │
│            │ Harbour & Vine             │                │
│            │                            │                │
│            │ RAY WOULD                  │                │
│            │ Close as false positive    │                │
│            │ ▓▓▓▓▓▓▓▓▓▓░ 96% sure       │                │
│            │                            │                │
│            │ press ↑ to see why         │                │
│            └────────────────────────────┘                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│        ← Correct      space Later      Agree →            │
└──────────────────────────────────────────────────────────┘
```

Everything that needs a person is a card in the same deck: an alert to judge, a proposal
from Ray, a colleague's comment, a signature gate with its checklist, a handover. You never
navigate — you answer the card in front of you and the next one arrives.

Everything *else* is summoned by one key and closes with Esc:

| Key | What appears |
|---|---|
| `→` `←` `↑` `space` | agree · correct · why · park it for later |
| `1-4` | pick the outcome, then how far the correction goes |
| `R` | **What Ray knows** — every rule, where it came from, on/off |
| `A` | **How much Ray may do alone** — the authority dial and what unlocks each notch |
| `E` | Playbook, flow, sources, audit trail — all generated, all downloadable |
| `K` | Ask Ray anything, by text or voice |
| `?` | The key list |

A compliance lead can coach forty alerts in ninety seconds without touching the mouse, and
a manager watching over their shoulder understands the product in one card.

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

---

## Studio next v2 — "the line"

Same engine, same flows, a third interface. The deck made the *decision* the unit; the line
makes the *boundary* the unit.

One spatial idea: **everything above the line, Ray handles alone; everything below comes to you.**
The line is the authority dial, drawn as a track across the screen with five notches
(watch · suggest · act with my approval · act alone on low risk · act alone). Locked notches are
dashed and say what unlocks them.

- **Above the line — "Ray handles these alone":** a live count of alerts decided without you, and
  the rules Ray applies as gate chips (each rule you teach lands here as a new chip).
- **The line:** click a notch to move it. Moving it up *takes work off your desk in front of you* —
  the queued alerts the new notch is trusted with leave the list, and Ray says how many it took.
  Moving it down brings work back. The workload visibly crosses the line.
- **Below the line — "Comes to you":** one list. Alerts to judge, Ray's proposals, a colleague's
  comment, signature gates with their checklist, handovers. The top item is open; answer it and the
  next opens. Agree is `A`; correct opens "what should it have been" then "how far should that go".

Everything else is a pop-over: `R` what Ray knows, `K` ask Ray (text or voice), `E` the generated
playbook / flow / model risk document / sources / audit trail, and the ⋯ menu for handover, copy,
fast-forward and rollback.

Why it is a different concept from the deck: the deck hides everything but one card; the line
keeps *both sides of the trust relationship in view at once*, so the user sees what promotion
actually does to their day.

---

## Studio next v3 — "Ray's permissions" (the simple one)

The earlier two versions were still dashboards of Ray's decisions. This one starts from one plain
sentence a compliance lead already understands: **what is Ray allowed to do?**

One short list of lines. Each line has a colour:

| Colour | Meaning |
|---|---|
| green | Ray does this alone |
| amber | Ray asks you first |
| red | Ray never does this |

Everything edits that list — talking ("anything over $100k goes to a supervisor"), correcting a
real alert ("not like that" → do it alone / ask me / never), a colleague's comment, Ray's own
suggestions (dashed lines you accept or decline). Nothing else is an artefact.

**Green is earned.** Every line starts amber. Turning one green is locked until Ray has either
been right on a few alerts you reviewed or been tested on your closed alerts; when it has, the line
itself says "Ray has earned this — make it green?". So the user watches the list turn green.

**One next step, always visible:** Test Ray on 1,000 closed alerts → run it beside your analysts for
four weeks → sign and go live → live. A single purple bar at the bottom says what it is and does it.
The four steps are labelled across the top; "Is Ray ready?" and "Where am I?" are one click.

Same capabilities as before: replay at 87% then 91% against the 90% bar, proposed lines from the
gap, shadow run and fast-forward, the five-item checklist plus three signatures, rollback, handover
with nudge and take-back, copy, undo, sources, generated playbook / model risk document / analyst
guide, flow and audit trail.
