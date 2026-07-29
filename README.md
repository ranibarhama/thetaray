# Ray Platform — Investigation Command Center (UX prototype)

An interactive, self-contained prototype exploring a redesign of **ThetaRay's Ray Platform**
(SONAR) — the AI-agent-assisted financial-crime investigation tool.

It reimagines the analyst experience around an **investigation command center**: a portfolio
**dashboard**, and a per-case **investigation desktop** where a live entity-network **map** is the
working surface, a **timeline** is docked to it (two-way linked), and every case area
(Artifacts, Attachments, Data Workspace, Agent Runs, Audit, LLM Usage, Visualizations) appears as a
light, draggable **floating card** over the map. A context-aware **AI advisor** floats on every
screen.

The interaction model borrows the *concept* of the "F-Tree" app — a living canvas of connected
entities, time as the master control, progressive focus, and story-first content — applied to AML
investigation. (It does **not** copy F-Tree's visual style.)

## Run it

It's one file. It must be served over HTTP (not opened as `file://`) because it uses in-browser
Babel, and it needs internet access for the React/Babel CDN.

```bash
cd ray-prototype
python3 -m http.server 8888
# then open:
#   http://localhost:8888/prototype.html
```

## What's inside

- `prototype.html` — the entire prototype: React (via CDN) + inline styles + inline data. No build
  step, no local dependencies.

## Data & scope

- Seeded with the real **CASE-AML-0001-3** (Marisol Rivera) alert-review case extracted from the
  live platform (customer, accounts, the two Mar-2026 Fedwire credits totalling $537,236.17, the
  internal transfers, the 3 wires to Mexico, the DOJ adverse-media hit, missing KYC).
- The other 7 investigations, and some transaction-level detail (per-wire dates, running balances),
  are **realistic mock/derived data** for the prototype — not pulled from the live system.

## Status

Design prototype for alignment — not production code and not connected to any backend.
Toggle dark/light with the 🌙/☀ button; open the "ⓘ about" panel (bottom-left) for a quick tour of
the concepts.
