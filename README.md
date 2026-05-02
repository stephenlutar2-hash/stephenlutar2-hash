# Stephen Lutar

  **Founder, SZL Holdings**

  Building governed decision infrastructure software. Systems where AI-assisted decisions require human accountability, and where observability connects to action — not just visualization.

  [![Ouroboros tests](https://img.shields.io/badge/runtime%20tests-150%20passing-2da44e?style=flat-square)](https://github.com/szl-holdings/ouroboros)
  [![ORCID](https://img.shields.io/badge/ORCID-0009--0001--0110--4173-A6CE39?style=flat-square&logo=orcid&logoColor=white)](https://orcid.org/0009-0001-0110-4173)
  [![DOI v2](https://img.shields.io/badge/DOI%20v2-10.5281%2Fzenodo.19934129-blue?style=flat-square)](https://doi.org/10.5281/zenodo.19934129)
  [![DOI v1](https://img.shields.io/badge/DOI%20v1-10.5281%2Fzenodo.19867281-blue?style=flat-square)](https://doi.org/10.5281/zenodo.19867281)

  ---

  ## About

  I work on governed runtime infrastructure for AI-assisted decisions. The thesis: AI outputs without traceability create noise, not trust. Signal to routing to approval gate to audit trail. That is the model.

  ---

  ## Current build — SZL Holdings

  A small portfolio of repos under [`szl-holdings`](https://github.com/szl-holdings) at varying stages of completion. The shipped, open-source piece is the runtime; the product surfaces are at design / scaffold / private-build stages.

  ### Runtime + thesis (shipped, open-source)

  - **[`@szl-holdings/ouroboros`](https://github.com/szl-holdings/ouroboros)** — bounded-loop runtime with measurable convergence. v6.1.0. **150 Vitest tests passing** at the release commit, in the single `@szl-holdings/ouroboros` package.
  - **[The Ouroboros Thesis](https://github.com/szl-holdings/ouroboros-thesis)** — v1 position paper and v2 empirical companion, plus the v6 operational contract JSON. v2 is the current published paper. v3 ("The Lutar Invariant") was retracted by the author on 2026-05-02 after self-audit; a rewritten v3 with verifiable claims is planned.

  ### Product surfaces (varying stages, mostly placeholder)

  | Repo | Status |
  |---|---|
  | [a11oy](https://github.com/szl-holdings/a11oy) | Public repo, README-stage |
  | [sentra](https://github.com/szl-holdings/sentra) | Public repo, README-stage |
  | [amaru](https://github.com/szl-holdings/amaru) | Public repo, README-stage |
  | [counsel](https://github.com/szl-holdings/counsel) | Public repo, README-stage |
  | [terra](https://github.com/szl-holdings/terra) | Public repo, README-stage |
  | [vessels](https://github.com/szl-holdings/vessels) | Public repo, README-stage |
  | [carlota-jo](https://github.com/szl-holdings/carlota-jo) | Public repo, README-stage |
  | [szl-holdings-platform](https://github.com/szl-holdings/szl-holdings-platform) | Public monorepo, in active development; CI is currently flaky on master |

  ---

  ## What the runtime ships

  The 150-test reference implementation pins the loop kernel, depth allocator, consistency scoring, proof-route resolver, risk-tier escalation gate, almanac cycle advancer, the v6 ecosystem layer (services, halts, routing, permissions, sandbox, agent registry), and a structured government-procurement readiness schema. All tests verifiable by running `pnpm exec vitest run` against the release commit.

  ---

  ## Architecture principles

  **AI governance by design.** Advisory agents cannot execute consequential actions without explicit human confirmation.

  **Evidence-backed decisions.** Every recommendation includes source citations, confidence scores, retrieval provenance. No opaque outputs.

  **Explicit over implicit.** Platform state is visible. No silent fallbacks. Failures surface.

  ---

  ## Stack

  ```
  TypeScript  React 19  Express 5  PostgreSQL 16  Drizzle ORM
  pnpm monorepo  Vite  Vitest  OIDC/PKCE
  ```

  ---

  ## Connect

  **Email:** stephenlutar2@gmail.com
  **ORCID:** [0009-0001-0110-4173](https://orcid.org/0009-0001-0110-4173)
  **LinkedIn:** [linkedin.com/in/stephen-l-279315240](https://linkedin.com/in/stephen-l-279315240)

  Open to honest conversation about the runtime, the math, and the work.
