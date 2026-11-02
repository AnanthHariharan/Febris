# Febris: local research prototype

**Not ready for real health decisions.** This is an incomplete technical prototype, not the requested finished family health product. It does not provide independent urgency assessment, care plans, saved profiles, or follow-up. Do not use it to decide whether or when to seek care. It is limited to adults aged 18–130 and only supports single-item questions. A real family-health application requires clinical safety review, authorized clinical content, privacy/security design, broader question handling, and provider approval.

## Run locally

Node 20 or newer is required; there are no dependencies. Run `npm start`, then visit http://localhost:3000. Run `npm test` for software checks. The server listens only on loopback. Data exists in the browser's memory and disappears on refresh or closing the page; there is deliberately no persistent storage or account system. Do not expose the server to the internet. No environment file is automatically loaded.

## Provider setup

1. Review [Infermedica developer access and terms](https://developer.infermedica.com/terms-of-service/) and truthfully request access for the intended personal family-health use. Trial approval, permission for the intended use, the enabled model, age range, geographic scope, and any ongoing contract must be confirmed with the provider. Do not assume trial access permits production.
2. Create an application in the approved developer portal. Obtain its App ID and App Key. Set `INFERMEDICA_APP_ID` and `INFERMEDICA_APP_KEY` as environment variables in the shell that starts the server; see `.env.example`. Never place keys in browser code or commit them. `PORT` is optional.
3. Start the server and use only fictional, non-identifying data while testing. A missing key produces an explicit error. There is no fixture fallback and no live integration call has been verified in this project.

The app sends free text to `/parse`, then sends confirmed structured evidence, age, and provider-required sex to `/diagnosis`. It sends all current evidence on each stateless diagnosis request. It omits names, though users must avoid including identifiers in free text. Errors and rate limits are surfaced and an old result is cleared before requesting a new one. The provider may retain request history; see the comparison. No raw request or response is intentionally written to server logs. This prototype does not control browser, OS, or provider logging. Review applicable data terms before entering real information.

## Implemented / blocked / deferred

- **Implemented:** server-side replaceable Infermedica adapter; explicit credential/network/rate-limit failures; adult intake and text parsing; confirmation/removal of recognized observations; present/absent/unknown states and deduplication; single-item provider questions; edits invalidate later answers and stale results; 10-answer cap and provider stop/emergency indication; provider score label and in-session text history; responsive local UI; limited unit tests. No synthetic medical inference is substituted.
- **Blocked:** live calls and end-to-end medical-provider verification require approved credentials. The intended use, enabled features, pediatric coverage, pricing and data terms require vendor confirmation. A safe care plan needs appropriately licensed clinical content and clinical review.
- **Deferred:** TypeScript migration; secure persistent profiles and episodes; pregnancy, medication, allergy and history intake; age-specific pediatric access; independent triage and scope checks; grouped questions; automatic answer replay and durable auditable episode history; evidence explanations and chart; onset/severity preservation; follow-up and resolved symptoms; sourced care guidance; voice; image evidence; comprehensive error and accessibility testing. The software tests are not clinical validation.

## Fictional test scenarios to add

Use a clearly described headache, an ambiguous complaint, a possible emergency, and an out-of-scope child. Confirm emergency always overrides a routine result and no stale results appear after errors. Tests currently cover evidence state, deduplication, request mapping, stopping precedence and rate-limit/credential failures; they do **not** establish clinical safety or completeness.
