<!--
  Personal profile README — stephenlutar2-hash/stephenlutar2-hash
  Series-A grade rewrite. Honesty doctrine LOCKED. Ground truth: lutar-lean@main, kernel c7c0ba17.
  Canonical numbers:
    749 declarations / 14 unique axioms / 163 tracked proof placeholders (sorries)
    Locked-proven (kernel) = EXACTLY 8 formulas — never inflated
    ~35 wired (in-progress, CI-checked but not locked); ~185 corpus total
    Lambda-uniqueness = Conjecture 1 (unconditional uniqueness machine-checked FALSE; conditional uniqueness proven, axiom-free)
    SLSA posture = HYBRID-HONEST: L1 honest posture; L2 build-attestation present; L2-verified / L3 / FedRAMP / Iron Bank / CMMC = roadmap.
  Products: a11oy (governed-inference command platform, live at a-11-oy.com) + killinchu (maritime/drone C2)
-->

<div align="center">

<img src="https://raw.githubusercontent.com/stephenlutar2-hash/stephenlutar2-hash/main/assets/banner-personal.png" alt="Stephen P. Lutar Jr. — provable AI governance" width="100%" />

# Stephen P. Lutar Jr.

### Founder & CEO, SZL Holdings — cryptographic proof infrastructure for consequential AI decisions

<p>
  <a href="https://github.com/szl-holdings"><img alt="SZL Holdings GitHub" src="https://img.shields.io/badge/GitHub-szl--holdings-181717?style=flat-square&logo=github&logoColor=white"></a>
  <a href="https://huggingface.co/SZLHOLDINGS"><img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-SZLHOLDINGS-FF9D00?style=flat-square"></a>
  <a href="https://a-11-oy.com"><img alt="a11oy" src="https://img.shields.io/badge/a11oy-live-4caf50?style=flat-square"></a>
  <a href="https://doi.org/10.5281/zenodo.19944926"><img alt="Thesis DOI" src="https://img.shields.io/badge/thesis%20DOI-10.5281%2Fzenodo.19944926-01696F?style=flat-square"></a>
  <a href="https://orcid.org/0009-0001-0110-4173"><img alt="ORCID" src="https://img.shields.io/badge/ORCID-0009--0001--0110--4173-A6CE39?style=flat-square&logo=orcid&logoColor=white"></a>
</p>

</div>

> **TL;DR** — I build AI governance you can *prove*, not just trust. Every consequential decision my stack makes becomes a cryptographically signed, replayable, tamper-evident receipt. The math behind the trust score is pinned in **Lean 4**: **8 formulas are kernel-locked-proven**, ~35 more are wired (CI-checked, not yet locked), and ~185 span the full corpus. The one uniqueness claim I cannot prove unconditionally I call by its honest name — **Conjecture 1**. I publish the numbers, the caveats, and the open problems. That honesty is the moat.

---

## The thesis

I started SZL Holdings on a single uncomfortable observation: **AI is being handed consequential decisions before the field built a proof layer for them.**

In defense, healthcare, and finance, operators deploy models that move real outcomes — and when something goes wrong, the honest answer to *"what did it decide, why, and was it still inside the authorized envelope?"* is usually a shrug and a log file. We have dashboards. We have observability. What we do not have is **cryptographic proof** — the kind a skeptical third party can verify on their own laptop, after the fact, trusting no one.

So I set out to build that missing layer. Not a smarter model — a **machine for producing evidence**. Every decision flows through a policy gate, gets bound to its evidence, is scored by a single trust aggregator, and is sealed into a DSSE-enveloped receipt chained over SHA-256. Hand that receipt to an auditor and they can replay it offline. Tamper with one byte and verification fails loudly.

The part I refused to fake is **the math**. It would have been easy to write "formally verified" on a slide and move on. Instead I pinned the core claims in Lean 4, let the kernel check them, and published exactly how far each one goes — including where it stops. **Eight formulas are locked-proven at kernel c7c0ba17.** The trust aggregator's *uniqueness* is **Conjecture 1**: unconditional uniqueness is machine-checked *false* (we found a concrete counterexample), conditional uniqueness is *proven axiom-free*, and I say both out loud. That discipline isn't modesty — it's the strongest thing I can put on the table.

---

## Products

| Product | What it is | Live |
|---|---|---|
| **a11oy** — Governed-Inference Command Platform | One pane of glass for governed AI: ask-&-act with deny-by-default safety gates, trust scoring, a live decision feed, signed receipts, formal-proof status, CVE/KEV/MITRE threat library, and model routing. | [a-11-oy.com](https://a-11-oy.com) |
| **killinchu** — Maritime & Drone C2 | Autonomous-systems field tool for air and sea: live track board, multi-sensor fusion, maritime picture (sanctions + dark-vessel detection), engagement rules, autonomy governance, and verify-it-yourself signed engagement receipts. | [SZLHOLDINGS/killinchu](https://huggingface.co/SZLHOLDINGS) |

Both ship as a single cosign-signed UDS bundle, deployable into an air-gapped cluster in one command.

---

## The math — honest labels

You don't need a PhD to read this. Here's the whole idea in three sentences:

1. Every decision produces a **receipt** — a signed, hash-chained record of *what happened, against what policy, with what evidence*.
2. A single function **Λ** ("Lambda") scores how trustworthy a decision is on a 0–1 scale, combining provenance, containment, coherence, and convergence.
3. The properties that make those receipts and that score *trustworthy* are written as theorems in **Lean 4** and checked by a machine — so you don't have to take my word for it.

**How to read the maturity labels — this is the honesty contract:**

| Label | Meaning |
|---|---|
| **LOCKED-PROVEN** | sorry-free, kernel-checked, Lean-core axioms only. Exactly **8** of these. Never inflated. |
| **WIRED (~35)** | CI-checked, running, not yet promoted to locked. Real work, honest stage. |
| **CORPUS (~185)** | Full experimental wave — machine-checked in CI, exploratory scope. |
| **CONJECTURE** | Not a theorem. Stated honestly as open; sometimes the negation is proven. |

### Lean 4 state @ kernel `c7c0ba17`

| Metric | Value |
|---|---|
| Declarations | **749** |
| Unique axioms | **14** |
| Tracked proof placeholders (sorries) | **163** |
| Locked-proven formulas | **8** |
| Wired (CI-checked, not locked) | **~35** |
| Full corpus (Waves 11–22) | **~185** |
| Λ uniqueness | **Conjecture 1** |
| Kernel commit | **`c7c0ba17`** |

Source: [`szl-holdings/lutar-lean@main`](https://github.com/szl-holdings/lutar-lean)

### Λ — the trust aggregator and the one honest conjecture

\[ \Lambda(x) = \prod_{i} \phi_i(x)^{\,w_i}, \qquad \sum_i w_i = 1,\quad w_i \ge 0 \]

It's a weighted geometric mean over the trust axes. The natural question: *"Is Λ the only function satisfying your axioms?"* Here is the completely honest answer:

| Claim | Status |
|---|---|
| Λ is **uniquely** defined by axioms A1–A5, *unconditionally* | **Conjecture 1 — machine-checked FALSE.** We found a concrete counterexample (`Round13.maxAgg_ne_Lambda`). |
| Λ is unique **given** slice-multiplicativity (separability) | **MACHINE-CHECKED, axiom-free.** `lambda_unique_of_separable` proves this conditionally, `#print axioms` ⊆ `{propext, Classical.choice, Quot.sound}`. |

In one line: **Λ's unconditional uniqueness is Conjecture 1** — provably false for A1–A5 alone. The conditional version is proven, axiom-free. Open bounty: [`BOUNTY.md`](https://github.com/szl-holdings/lutar-lean/blob/main/BOUNTY.md).

---

## Honest posture — what I claim, and what I don't

> I do **not** claim "zero sorry," "fully verified," "Λ proven," "SLSA L2 verified," or "L3." Every count below is reproducible from `lutar-lean@main`.

| Claim | Status |
|---|---|
| Locked-proven formulas | **8** — never inflated |
| Λ uniqueness | **Conjecture 1** (unconditional = false; conditional = proven axiom-free) |
| SLSA posture | **L1 honest + L2 build-attestation present** · L2-verified / L3 / FedRAMP / Iron Bank / CMMC = roadmap |
| DSSE-signed receipts | **live** (ECDSA-P256) |
| Sovereign GPU mesh | **live** |
| Unified verifiable ledger | **live** |

---

## Verify it yourself

```bash
# 1) Verify a build attestation on the command-platform image
gh attestation verify oci://ghcr.io/szl-holdings/a11oy:latest --repo szl-holdings/a11oy

# 2) Verify the signed mesh bundle (cosign keyless)
cosign verify oci://ghcr.io/szl-holdings/szl-mesh:0.4.0 \
  --certificate-identity-regexp="^https://github.com/szl-holdings/" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"

# 3) Verify a killinchu engagement receipt OFFLINE
cosign.pub → https://szlholdings-killinchu.hf.space/cosign.pub
receipt  → https://szlholdings-killinchu.hf.space/api/killinchu/v1/receipt/export
# tamper one byte → "Verification failure"
```

---

## Stack

**Languages:** TypeScript · Python · Lean 4 · Bash  
**Runtime:** Node.js 24 · pnpm · React · Vite · FastAPI  
**Data:** PostgreSQL · Drizzle ORM · Redis · pgvector  
**Supply chain:** Sigstore / cosign · Zenodo · CodeQL · Trivy · Gitleaks · OpenSSF Scorecard · SBOM  
**Deployment:** UDS Core / Zarf · uds-cli · Kubernetes / Istio Ambient

---

## Where to find me

| | |
|---|---|
| Company (GitHub) | [github.com/szl-holdings](https://github.com/szl-holdings) |
| Command platform | [a-11-oy.com](https://a-11-oy.com) |
| Products (Hugging Face) | [huggingface.co/SZLHOLDINGS](https://huggingface.co/SZLHOLDINGS) |
| Thesis (concept DOI) | [`10.5281/zenodo.19944926`](https://doi.org/10.5281/zenodo.19944926) |
| ORCID | [`0009-0001-0110-4173`](https://orcid.org/0009-0001-0110-4173) |
| Email | [`stephen@szlholdings.com`](mailto:stephen@szlholdings.com) |

---

<sub>© 2026 Stephen P. Lutar Jr. · Code: Apache-2.0 · Research: CC BY 4.0 · Every count and DOI on this page is verifiable against <a href="https://github.com/szl-holdings/lutar-lean">lutar-lean@main</a>. Locked-proven = exactly 8 formulas at kernel c7c0ba17. Λ-uniqueness = Conjecture 1 (unconditional = machine-checked false; conditional = proven axiom-free). SLSA: L1 honest posture; L2 build-attestation present; L2-verified / L3 / FedRAMP / Iron Bank / CMMC = roadmap.</sub>
