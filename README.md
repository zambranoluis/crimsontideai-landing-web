# CrimsonTide website

CrimsonTide is a six-route Next.js corporate site for the company, its independent products, tailored AI/software work, documented experience, and contact enquiries.

## Routes and destinations

| Route | Purpose | Primary destination |
| --- | --- | --- |
| `/` | Product + Solutions introduction | Products, Solutions, Work, Company, or Contact |
| `/products` | Introduces two independent products | [OpenJM](https://openjm.ai) and [Sentinel](https://crimsontide.app), each in a new tab |
| `/solutions` | Tailored AI and software engagements | `/contact` |
| `/work` | General Food case, sector relevance, and partner relationships | `/solutions` or `/contact` |
| `/company` | Company identity and Jamaican origin | `/contact` |
| `/contact` | Published contact details and enquiry form | `POST /api/contact` or `info@crimsontide.ai` |

OpenJM and Sentinel are separate product properties. This site explains each product and hands visitors to its own destination; it does not host product onboarding, pricing, support, or documentation.

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:contact
npm run build
npm run test:e2e -- --workers=1
```

Development and the Playwright configuration use `http://localhost:3001`. Reuse a compatible server already listening on that port rather than starting another one.

For focused browser coverage, use the file-specific commands in [`tests/e2e/README.md`](tests/e2e/README.md). Playwright exercises Chromium desktop plus tablet/mobile emulation; it is not proof for Firefox, Safari, physical devices, or a production deployment.

## Source architecture

- Each App Router route owns its sections in `_sections/<SectionName>/`. Home uses `src/app/_sections`; named routes use `src/app/<route>/_sections`.
- Section-owned helpers, data, styles, and artwork stay beside that section. Components shared only within one route live in that route's `_components` directory.
- `src/components/layout` contains the site header and footer. `src/components/sections` contains only cross-route sections, and `src/components/ui` contains shared primitives.
- Route `page.tsx` files own metadata and compose sections; they do not own section copy or data.
- `src/app/api/contact/` owns the Node.js contact endpoint, validation handoff, mail construction, and development mail transport. Browser code never receives SMTP credentials.

## Project documents

- `docs/content.md` owns displayed copy, actions, contact details, and form outcomes.
- `docs/contact-email-setup.md` documents Google Workspace SMTP setup, development mocks and the manual two-inbox check.
- `DESIGN.md` owns the shared visual, motion, navigation, and responsive behavior rules.
- `PRODUCT.md` owns company and product positioning.
- `.impeccable/surfaces/` owns the ordered experience and route-specific behavior for each of the six implemented surfaces.
- `tests/e2e/README.md` owns the supported browser-check commands and local runtime details.
- `docs/scroll-replay-verification.md`, `docs/home-products-verification.md`, and `docs/contact-verification.md` are dated verification records, not current proof of behavior or production delivery.

When an interaction changes, update its route brief (and `DESIGN.md` when the rule is shared) in the same change as the implementation and behavioral tests. A change is not complete while those descriptions and checks disagree.

## Contact email capability

The implemented `POST /api/contact` endpoint validates the enquiry, sends the company message to `info@crimsontide.ai`, then sends a separate visitor acknowledgement. In development it always uses an in-memory transport and sends no email. In production it requires private `SMTP_USER` and `SMTP_APP_PASSWORD` configuration for the authorized Google Workspace sender. A successful response records SMTP acceptance, not inbox receipt; deployment, credentials, and the manual two-inbox verification remain external release work. See [`docs/contact-email-setup.md`](docs/contact-email-setup.md).
