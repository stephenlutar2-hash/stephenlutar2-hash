# Stephen Lutar

  **Founder, SZL Holdings**

  Building governed decision infrastructure software. Systems where AI-assisted decisions require human accountability, and where observability connects to action — not just visualization.

  [![Ouroboros tests](https://img.shields.io/badge/runtime%20tests-150%20declared-2da44e?style=flat-square)](https://github.com/szl-holdings/ouroboros)
  [![ORCID](https://img.shields.io/badge/ORCID-0009--0001--0110--4173-A6CE39?style=flat-square&logo=orcid&logoColor=white)](https://orcid.org/0009-0001-0110-4173)
  [![DOI v3](https://img.shields.io/badge/DOI%20v3-10.5281%2Fzenodo.19951520-blue?style=flat-square)](https://doi.org/10.5281/zenodo.19951520)
  [![DOI v2](https://img.shields.io/badge/DOI%20v2-10.5281%2Fzenodo.19934129-blue?style=flat-square)](https://doi.org/10.5281/zenodo.19934129)
  [![DOI v1](https://img.shields.io/badge/DOI%20v1-10.5281%2Fzenodo.19867281-blue?style=flat-square)](https://doi.org/10.5281/zenodo.19867281)
  [![Concept DOI](https://img.shields.io/badge/Concept%20DOI-10.5281%2Fzenodo.19944926-1f6feb?style=flat-square)](https://doi.org/10.5281/zenodo.19944926)

  ---

  ## About

  I work on governed runtime infrastructure for AI-assisted decisions. The thesis: AI outputs without traceability create noise, not trust. Signal to routing to approval gate to audit trail. That is the model.

  ---

  ## Current build — SZL Holdings

  A small portfolio of repos under [`szl-holdings`](https://github.com/szl-holdings) at varying stages of completion. The shipped, open-source piece is the runtime; the product surfaces are at design / scaffold / private-build stages.

  ### Runtime + thesis (shipped, open-source)

  - **[`@szl-holdings/ouroboros`](https://github.com/szl-holdings/ouroboros)** — bounded-loop runtime implementing the Lutar Invariant Λ. v6.1.0. **150 declared Vitest tests** at the release commit, in the single `@szl-holdings/ouroboros` package.
  - **[The Ouroboros Thesis](https://github.com/szl-holdings/ouroboros-thesis)** — papers (v1 position, v2 empirical, v3 closed-form scalar law), v6 operational contract JSON, and a falsification ledger. v3 is the current paper.

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

  ## Math (the part that is finished)

  The Ouroboros Thesis v3 introduces the **Lutar Invariant Λ**, a closed-form scalar in [0, 1] that aggregates nine independent runtime-trust axes (Cleanliness, Horizon, Resonance, Frustum, Geometry, Invariance, Moral, Being, Non-measurability) into a single auditable number. v3 proves uniqueness under four axioms (monotonicity, zero-pinning, Egyptian inspectability, Page-curve concavity).

  The 150-test reference implementation pins the runtime contract, the v6 ecosystem layer (services, halts, routing, permissions, sandbox, agent registry), and the government readiness schema.

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
