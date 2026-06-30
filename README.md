<!--
  Personal profile README — stephenlutar2-hash/stephenlutar2-hash
  Investor/genius-grade rewrite · 2026-06-30 · Honesty doctrine LOCKED.
  Ground truth: lutar-lean@main, kernel c7c0ba17.
  Canonical numbers: 8 locked-proven formulas · ~185 corpus · Λ = Conjecture 1 · SLSA L1 honest · L2 attested · L3 roadmap
  Sign-off: Stephen Lutar <stephenlutar2@gmail.com>. DCO + Conventional Commits.
-->

<div align="center">

<img src="https://raw.githubusercontent.com/stephenlutar2-hash/stephenlutar2-hash/main/assets/banner-personal.png" alt="Stephen P. Lutar Jr. — provable AI governance" width="100%" />

# Stephen P. Lutar Jr.

### AI/ML systems architect · Founder & CEO, SZL Holdings

<p>
  <a href="https://github.com/szl-holdings"><img alt="SZL Holdings" src="https://img.shields.io/badge/GitHub-szl--holdings-181717?style=flat-square&logo=github&logoColor=white"></a>
  <a href="https://a-11-oy.com"><img alt="a11oy" src="https://img.shields.io/badge/a11oy-live-4caf50?style=flat-square"></a>
  <a href="https://doi.org/10.5281/zenodo.19944926"><img alt="Zenodo DOI" src="https://img.shields.io/badge/Zenodo%20DOI-10.5281%2Fzenodo.19944926-01696F?style=flat-square"></a>
  <a href="https://orcid.org/0009-0001-0110-4173"><img alt="ORCID" src="https://img.shields.io/badge/ORCID-0009--0001--0110--4173-A6CE39?style=flat-square&logo=orcid&logoColor=white"></a>
  <a href="https://huggingface.co/SZLHOLDINGS"><img alt="Hugging Face" src="https://img.shields.io/badge/%F0%9F%A4%97-SZLHOLDINGS-FF9D00?style=flat-square"></a>
</p>

</div>

---

I build the accountability layer that consequential AI is missing.

When an AI system makes a decision that matters — in defense, finance, critical operations — you should be able to verify *exactly* what it decided, under what authority, on what evidence, and that the record was never quietly changed. Today, you mostly can't. I set out to fix that.

**SZL Holdings** is the company I founded to build this missing layer: a **governed-inference substrate** where every AI action produces a cryptographically signed, tamper-evident receipt, and the trust math behind it is pinned in **Lean 4** and checked by a proof machine — not just claimed on a slide.

The result is **[a11oy](https://a-11-oy.com)**: a governed-AI Command Center with deny-by-default safety gates, trust scoring, and signed receipts for every decision. We apply the same substrate to autonomous systems in the field: live tracking, multi-sensor fusion, and governance receipts for counter-UAS and maritime operations.

---

## What I've built

| Artifact | What it is |
|---|---|
| **[a11oy](https://a-11-oy.com)** | Governed-AI Command Center. Deny-by-default gates, trust scoring, signed receipts. Live at a-11-oy.com. |
| **[lutar-lean](https://github.com/szl-holdings/lutar-lean)** | Lean 4 proof library. 8 formulas locked-proven in the kernel, ~185 machine-checked theorems. DOI: [10.5281/zenodo.20434308](https://doi.org/10.5281/zenodo.20434308). |
| **Counter-UAS governance** | Live track board, multi-sensor fusion, engagement rules, and signed engagement receipts for air and maritime autonomy. |
| **Sovereign on-metal AI** | Full governed inference stack — deployable air-gapped on your own hardware, signed and verifiable end to end. |

---

## The math, briefly

Every governed decision is scored by a function **Λ** — a weighted geometric mean over four trust axes. Its properties are formally stated and machine-checked:

- **8 formulas are locked-proven** at kernel commit `c7c0ba17`: receipt replay determinism, DAG acyclicity, FIFO ordering, ledger conservation, bounded coupling, Reed–Solomon recovery, entropy budget, append-only monotonicity.
- **~185 theorems** machine-checked across Waves 11–23.
- **Λ unconditional uniqueness** is **Conjecture 1** — I found a concrete counterexample and publish it openly. The conditional version (given separability) is **proven axiom-free** (Theorem U). I call the open problem by its honest name and offer a bounty to close it.

> The discipline of saying "this is proven, this is conjecture, this is wrong" is not modesty. It is the strongest claim I can make to an auditor.

Thesis DOI: **[10.5281/zenodo.19944926](https://doi.org/10.5281/zenodo.19944926)**

---

## Verify it yourself

```bash
# Verify a build attestation on the command platform image
gh attestation verify oci://ghcr.io/szl-holdings/a11oy:latest --repo szl-holdings/a11oy

# Verify a governance receipt from the field node (offline, trust no one)
curl -s https://szlholdings-killinchu.hf.space/cosign.pub -o cosign.pub
curl -s https://szlholdings-killinchu.hf.space/api/killinchu/v1/receipt/export > receipt.json
# tamper one byte → "Verification failure"
```

---

## Stack

**Languages:** TypeScript · Python · Lean 4  
**Runtime:** Node.js · React · FastAPI  
**Proof:** Lean 4 + Mathlib  
**Supply chain:** Sigstore / cosign · Zenodo · CodeQL · Trivy · OpenSSF Scorecard  
**Deployment:** Kubernetes · Zarf · air-gap bundles

---

## Find me

| | |
|---|---|
| Company | [github.com/szl-holdings](https://github.com/szl-holdings) |
| Command platform | [a-11-oy.com](https://a-11-oy.com) |
| Hugging Face | [huggingface.co/SZLHOLDINGS](https://huggingface.co/SZLHOLDINGS) |
| Thesis DOI | [10.5281/zenodo.19944926](https://doi.org/10.5281/zenodo.19944926) |
| ORCID | [0009-0001-0110-4173](https://orcid.org/0009-0001-0110-4173) |
| Email | [stephen@szlholdings.com](mailto:stephen@szlholdings.com) |

---

<sub>© 2026 Stephen P. Lutar Jr. · Code: Apache-2.0 · Research: CC BY 4.0 · Locked-proven = exactly 8 formulas at kernel c7c0ba17 · Λ = Conjecture 1 (unconditional = machine-checked false; conditional = proven axiom-free) · SLSA L1 honest · L2 build-attested · L3 roadmap · No ATO claimed</sub>
