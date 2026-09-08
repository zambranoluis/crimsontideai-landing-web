# Experience Context

## Status

- **Classification:** context. This document records the information architecture, navigation behaviour, page objectives, and writing direction required to interpret and execute CrimsontideAI website work. It is not normative. It does not override `AGENTS.md`, `CLAUDE.md`, or any document in `AGENTS/roles/`.
- **Related context:** `docs/product.md` (company and product truth), `docs/content.md` (approved copy), `docs/structure.md` (composition and page section sequences), `docs/design.md` (visual language).
- **Scope:** six routes. The site has no sub-routes. Labels that name a page which does not exist are recorded under *Footer labels without pages*.
- **Unresolved items** are marked `[Pending validation]`. Do not resolve them by inference.

## Core transformation

The previous website led with products and capabilities, then explained the company. This website reverses this:

> CrimsonTide → explains who it is → presents what it builds → presents its products → presents its solutions → demonstrates experience → builds trust → leads to contact

This ordering governs content, UX, UX writing, information architecture, design, and development.

## UX principles

1. CrimsonTide must be understood before its products.
2. Products must preserve their independence.
3. Products and solutions must be two clearly different paths.
4. The company must demonstrate experience before asking for contact.
5. Product details belong to the products' own experiences, not to this site.
6. Do not repeat the previous architecture based on mixed capability pages.
7. Reduce technical jargon in the first layers.
8. Allow progressive depth within a page rather than through added routes.
9. Maintain a clear path toward contact.
10. Use real evidence.
11. Avoid audience overload on a single page.
12. Keep Jamaica present without allowing it to dominate the whole narrative.

## Information architecture

Six routes. Depth is achieved through sections within a route, not through nested routes.

| Route        | Page               | Nav label          |
| ------------ | ------------------ | ------------------ |
| `/`          | Home               | Home               |
| `/products`  | Products           | Products           |
| `/solutions` | AI Solutions       | AI Solutions       |
| `/work`      | Work & Credibility | Work & Credibility |
| `/company`   | Company            | Company            |
| `/contact`   | Contact            | Contact            |

### In-page anchors

Anchors are the only sub-navigation. Each targets a section on the route that owns it.

| Anchor               | Route       | Target section    |
| -------------------- | ----------- | ----------------- |
| `#home-build`        | `/`         | What we build     |
| `#products-openjm`   | `/products` | OpenJM showcase   |
| `#products-sentinel` | `/products` | Sentinel showcase |
| `#work-cases`        | `/work`     | Case studies      |
| `#company-about`     | `/company`  | About CrimsonTide |

### Footer labels without pages

The footer names areas that have no route of their own. They are labels, not destinations. Do not create a route for one without a decision to build the page.

| Label                                                                                            | Resolves to  | Note                                                                          |
| ------------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------- |
| OpenJM · Sentinel                                                                                | `/products`  | Both target product showcases on the single Products route                    |
| AI Solutions · Custom Software Development · Product Customisation · Integrations & Deployments | `/solutions` | The four offerings are content within one route                               |
| Case Studies · Industries · Clients & Partnerships                                               | `/work`      | The three sections of the Work route                                          |
| About CrimsonTide · Built in Jamaica                                                             | `/company`   | The two sections of the Company route                                         |
| Team · Insights                                                                                  | `/company`   | No section exists for either; the label reaches the route with no matching target |
| Contact Us · Book a Consultation · Product Enquiry                                               | `/contact`   | One form serves all three intents; its selector carries the distinction       |
| Privacy · Terms · Support                                                                        | nothing      | No page and no section. Destination `[Pending validation]`                    |

## Primary navigation

Header order: **Home · Products · AI Solutions · Work & Credibility · Company · Contact**.

Highlighted header CTA: **Contact CrimsonTide**, linking to `/contact`. Every closing CTA across the site uses the same label and destination, except `/solutions`, which uses _Discuss an AI solution_ to the same route.

There must never be multiple competing primary CTAs in one region.

## Navigation behaviour

- The current route is marked in the primary navigation with a visible state that does not depend on animation or hover.
- Changing route returns the reader to the top of the page.
- An in-page anchor on the current route scrolls smoothly to its section and does not change route.
- Document title: `CrimsonTide — AI software company, built in Jamaica.` on Home; `<Page> — CrimsonTide` on every other route.
- Below 1024px the primary navigation collapses behind a toggle. Opening it moves focus to the first link. It closes on Escape with focus returned to the toggle, on a pointer press outside it, and on route change.
- Below 1024px the header CTA is removed from the header. Contact remains reachable from the collapsed navigation and from every closing CTA.

## Navigation journeys

| Visitor                  | Journey                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| Looking for a product    | Home → Products → OpenJM / Sentinel section → Contact                    |
| Company with a problem   | Home → AI Solutions → proof section → Contact                            |
| Wants to adapt a product | Home → Products → AI Solutions (Product Customisation) → Contact         |
| Validating credibility   | Home → Work & Credibility → case, industries, partners → Company → Contact |
| Partner or press         | Home → Company → Contact                                                 |

## Page objectives

Section sequences and their compositional patterns are owned by `docs/structure.md`. Copy is owned by `docs/content.md`. This section records what each route must achieve.

### Home — `/`

Explain within a few seconds: what CrimsonTide is; what it builds; which products it has; what type of solutions it develops; why the company can be trusted; how to start a conversation.

The two paths must read as distinct on this page: proprietary products on one side, solutions designed around a specific need on the other. Each path exits to its own route.

### Products — `/products`

Present the portfolio **without merging the products**. OpenJM and Sentinel each get their own showcase section with its own summary, its own three supporting points, and its own visual treatment.

- **OpenJM** — conversational AI for questions, information, files, and tasks. Developed in Jamaica, available worldwide.
- **Sentinel** — computer vision that turns existing camera networks into detection, alerts, and operational intelligence. Designed to work with existing camera infrastructure.

**Rule:** do not use a feature-comparison table. The products do not compete. Distinguish them only by the problem they solve.

Do not duplicate the products' own experiences here: no complete pricing, no full FAQ set, no model catalogue, no onboarding, no full technical documentation. This route is a corporate bridge toward each product.

### AI Solutions — `/solutions`

Establish that CrimsonTide can design and build technology around an organisation's context when a need requires something more specific than an existing product.

The route must make clear that CrimsonTide is a software company, not only an AI model company, and that a solution is carried through to implementation rather than stopping at a concept. The four offerings named in the footer — AI Solutions, Custom Software Development, Product Customisation, Integrations & Deployments — are content within this route.

**Warning:** specific capabilities must be validated by product, by client, and by project. Do not state a capability as available because a related one exists.

### Work & Credibility — `/work`

Replace the previous logic of using industry and technology pages as implicit proof. Present explicit evidence.

- **Case studies.** General Food Supermarket — Liguanea is the current public asset. A case may only be attributed to a specific product when evidence confirms it.
- **Industries.** Five sectors, shown as sector relevance rather than a claim of complete coverage. These sectors are strongly associated with Sentinel and must not be presented as the entirety of CrimsonTide's industries.
- **Clients & partnerships.** Do not reduce this to a wall of logos. Where evidence permits, give the type of relationship, the project, and the related case.

### Company — `/company`

Answer _who is CrimsonTide_ without first describing the features of Sentinel or OpenJM.

Covers the reference statement, proprietary product development, custom software, AI solutions, adaptation capability, purpose, origin, and regional focus with global capability.

**Built in Jamaica** is a section, not a page. Avoid excessive dependence on the flag, tourism aesthetics, clichés, and turning "Jamaica" into a substitute for the value proposition.

### Contact — `/contact`

The primary corporate conversion point. One form serves product enquiries, solution enquiries, partnerships, and general contact; the enquiry selector carries the distinction.

Form fields, selector options, and supporting copy are defined by `docs/content.md`. Company contact facts are owned by `docs/product.md`.

The form has no submit destination in the current scope. Client-side validation must remain accessible: errors announced in text, invalid fields marked, and the message cleared once the field becomes valid. Never rely on colour alone to signal an error.

## UX writing principles

Corporate communication must be clear, direct, professional, technological, understandable, confident, approachable without being informal, and specialised without becoming jargon.

Recommended message order:

1. What CrimsonTide is.
2. What it builds.
3. Which products it has.
4. What solutions it can develop.
5. What experience it demonstrates.
6. Why to trust it.
7. How to make contact.

## What the website must avoid

- presenting CrimsonTide as Sentinel;
- presenting CrimsonTide as OpenJM;
- presenting RAHKIA as an independent product;
- mixing product capabilities with corporate services without hierarchy;
- using all of Sentinel's industries to define the company;
- duplicating all product content;
- depending on technical jargon as the first explanation;
- using Jamaica as the only value proposition;
- showing an endless list of capabilities;
- having multiple competing primary CTAs;
- creating a route for a footer label instead of a decided page.
