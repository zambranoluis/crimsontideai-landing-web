# Experience Context

## Ownership, sources, and status

This document owns route purposes, section sequence, visitor journeys, navigation, interactions, states, and behavioral adaptation. `docs/product.md` qualifies facts; `docs/content.md` owns wording and its status; `docs/design.md` owns visual and spatial decisions. Root and specialist policies retain their operational authority.

The six-route scope is retained by the documentation plan. Section sequences are a working baseline derived from the supplied copy and preview. Proposals are not accepted implementation decisions. Application observations below come from source inspection on September 8, 2026, without browser verification.

Source paths are relative to the repository root: `src/app/page.tsx`, `src/app/products/page.tsx`, their section components, and the shared SiteHeader/SiteFooter components. The separate reference is `../mnk-lab/crimsontide-landing-mnk/web-mock/index.html` with `../mnk-lab/crimsontide-landing-mnk/web-mock/assets/js/app.js`. It switches six article views using URL hashes; these are not six Next.js routes. The PDF qualified in Product supports the corporate journey; its wider sitemap does not expand current scope.

## Visitor journey

Introduce CrimsonTide → explain what it builds → distinguish products and tailored solutions → demonstrate experience → explain company context → invite contact. Visitors may take a relevant exit before completing that narrative.

Keep products independent and products distinct from tailored solutions. Provide progressive depth within relevant sections without duplicating product pricing, onboarding, model catalogues, full FAQs, support, or technical documentation. Explain capability before jargon; Jamaica strengthens the proposition without replacing it. Cases and relationships support trust only as qualified in Product. Avoid an undifferentiated capability list, audience overload, and competing primary actions within one region.

| Visitor need | Intended path | Current limit |
| --- | --- | --- |
| Find a product | Home → Products → showcase → product experience | External exits exist in source; final destinations remain unconfirmed |
| Solve a problem | Home → AI Solutions → evidence → Contact | Solutions and Contact are preview-only |
| Adapt a product | Products → AI Solutions / Product Customisation → Contact | No dedicated adaptation route or preselected enquiry |
| Assess credibility | Home → Work → case / sectors / relationships → Company → Contact | Work, Company, and Contact are preview-only |
| Partner, press, or talent enquiry | Home → Company → Contact | Team and Insights have no matching page or section |

## Route support

| Intended route | Purpose | Current Next.js support |
| --- | --- | --- |
| `/` | Understand company, offerings, credibility, and next step | Page with five sections |
| `/products` | Identify the appropriate independent product | Hero and two showcases |
| `/solutions` | Understand work tailored to an organisation | No page; preview and copy only |
| `/work` | Assess a case, sector relevance, and relationships | No page; preview and copy only |
| `/company` | Understand capability, purpose, and origin | No page; preview and copy only |
| `/contact` | Start a corporate enquiry | No page or submission integration |

Navigation links do not establish destination availability. No nested corporate routes are implemented. Footer labels do not authorize additional pages.

## Shared navigation, entry, and return

The source header order is Home, Products, AI Solutions, Work & Credibility, Company, Contact, followed by Contact CrimsonTide → `/contact`. The logo returns to Home. Below 1024px, the links collapse into a menu and the separate header CTA disappears. Contact remains in the menu, though its route is absent.

`src/components/sections/SiteHeader/SiteHeader.tsx` marks the current route with `aria-current="page"`. Opening the menu focuses its first link. Escape closes it and returns focus to the toggle; outside pointer press closes it without explicit focus restoration. Selecting a menu link closes it. Crossing to desktop closes it and transfers focus from within the menu to the current desktop link when available; crossing back transfers desktop-navigation focus to the toggle. No focus trap or universal dismissal on every route-change mechanism is established.

The header requests a scroll reset for ordinary clicks to a different header route and applies it when that pathname arrives. This does not guarantee every route transition resets scroll. The preview resets scroll and changes title on hash-selected page changes. Home declares `CrimsonTide — AI software company, built in Jamaica.`; Products declares `Products — CrimsonTide`. The other intended titles use the page name and CrimsonTide; they are not implemented Next.js metadata.

Next.js section links use native anchors. Global CSS requests smooth scrolling with header clearance and removes smoothing for reduced motion. The skip link targets focusable `#main-content`. No general route-heading focus management or custom Back/Forward restoration is implemented by the header or ActionLink. Product-site return uses normal browser navigation; restored position and focus remain unverified.

The preview intercepts section links only within the active view, scrolls without updating the hash, and does not explicitly move focus. An unrecognised hash selects Home; it is not equivalent to a Next.js deep link.

| Section destination | Application status | Preview status |
| --- | --- | --- |
| `/#home-build` | Exists | Section in Home |
| `/products#products-openjm` | Exists | Section in Products |
| `/products#products-sentinel` | Exists | Section in Products |
| `/work#work-cases` | Route absent | Section in Work |
| `/company#company-about` | Route absent | Section in Company |

### Footer destinations

Source: `src/components/sections/SiteFooter/SiteFooter.tsx`.

| Labels | Current destination | Qualification |
| --- | --- | --- |
| OpenJM; Sentinel | Respective Products anchors above | Corporate showcases, not external product exits |
| AI Solutions; Custom Software Development; Product Customisation; Integrations & Deployments | `/solutions` | Four offerings within one intended route |
| Case Studies; Industries; Clients & Partnerships | `/work#work-cases`; `/work`; `/work` | Only case has an explicit section target |
| About CrimsonTide; Built in Jamaica | `/company#company-about`; `/company` | Route absent |
| Team; Insights | `/company` | No matching section in preview either |
| Contact Us; Book a Consultation; Product Enquiry | `/contact` | One intended form; no booking or preselection |
| Privacy; Terms; Support | Noninteractive text | Destinations and content pending |
| LinkedIn; X; YouTube | Noninteractive text | Account URLs pending; preview platform homepages are placeholders |
| Email | `mailto:hello@crimsontide.ai` | Working address, qualified by Product |

## Home — `/`

Need: understand the company before choosing a product, solution, or credibility path. Outcome: a relevant next step.

| Sequence | Purpose and relationship | Actions |
| --- | --- | --- |
| Hero | Introduce Product + Solutions proposition | Explore what we build → `#home-build` |
| What we build | Explain two paths, two independent products, and four tailored offerings | Product actions → respective Products anchors; Explore Solutions → `/solutions` |
| Experience / proof | Ground capability in General Food Supermarket and qualified organisation names | View case study → `/work#work-cases`; Explore our work → `/work` |
| Company, built in Jamaica | Relate origin to capability and three supporting principles | About CrimsonTide → `/company#company-about` |
| Closing CTA | Invite contact after explanation and evidence | Contact CrimsonTide → `/contact` |

All five sections exist. Source places product panels before a separate solutions panel, unlike the image's peer Products/Solutions groups. Case media precedes copy; it is illustration, not extra evidence. No modal, filter, or dismissible section is defined. Keyboard and touch users reach the same links; no essential content depends on hover. Narrow-screen reading retains explanatory and action order while supporting media may simplify. Shared navigation and motion govern interruption and return.

## Products — `/products`

Need: identify the right product without interpreting the products as tiers or competitors. Outcome: reach the product experience, or use corporate navigation for a tailored enquiry.

The working presentation uses separate showcases rather than a feature-comparison table: the products address different problems.

| Sequence | Purpose and relationship | Actions |
| --- | --- | --- |
| Hero | Frame distinct product contexts | Explore our products → `#products-openjm` |
| OpenJM | Explain conversational work, three supporting points, origin and availability | Explore OpenJM → `https://openjm.ai` in source |
| Sentinel | Explain computer vision, three supporting points, deployment context | Explore Sentinel → `https://crimsontide.app` in source |

No closing CTA section exists. Both external actions are ordinary links without an explicit new-tab target. Final destination acceptance and external behavior remain `[Pending validation]`. The preview actions return to their own showcase anchors, not product sites.

The current hero has a full-bleed image/mesh behind one copy column, not a radial split. OpenJM points form a vertical list inside the copy region. Sentinel points form a separate three-column row beneath copy and preview; the showcase is not mirrored. Main regions stack below 1024px; Sentinel points become one column below 768px. OpenJM reading order is copy including points → preview → note/action; Sentinel is copy → preview → points → note/action. Dimensions belong to Design.

Previews are illustrative and `aria-hidden`, not live chat, camera, or analytics controls. Their sample labels and metrics do not prove capabilities. No comparison, registration, or demo-booking interaction is present. Pointer effects add no task unavailable to touch or keyboard. ProductMotion contains pause handling, but runtime continuity and return from external sites remain unverified.

## AI Solutions — `/solutions`

Need: assess whether CrimsonTide can address an objective or workflow. Outcome: understand an engagement through implementation and reach Contact with context.

| Sequence | Purpose and relationship | Actions |
| --- | --- | --- |
| Hero | Introduce tailored AI work | Discuss an AI solution → intended `/contact` |
| Problems & Opportunities | Challenge, process improvement, or new capability | Reading progression |
| Built Around Your Context | Objective → environment → solution | Ordered narrative, not a wizard |
| From Concept to Real Use | Build → connect → put into use | Ordered steps, not completion states |
| Experience / Proof | Case and qualified organisations support implementation intent | Preview Work view; intended `/work#work-cases` |
| Closing CTA | Invite the objective | Discuss an AI solution → intended `/contact` |

Preview/copy only. Four offering labels do not represent four service pages. Qualify capabilities by project, client, and product. Proposed adaptation preserves step labels when connectors disappear and uses a vertical reading sequence on narrow screens. Links carry exits without hover dependency. No local form or modal requires dismissal; shared navigation provides interruption and return. Application focus behavior is unimplemented.

## Work & Credibility — `/work`

Need: assess evidence and relevance. Outcome: understand its limits and choose solutions or contact.

| Sequence | Purpose and relationship | Actions |
| --- | --- | --- |
| Hero | Invite evidence inspection | View case studies → intended `#work-cases` |
| Case studies | General Food Supermarket context → technology → objectives | Explore the case → same anchor in preview |
| Industries | Five areas of sector relevance; retail relates to the case | Explore solutions for your sector → intended `/solutions` |
| Clients & Partnerships | Distinguish documented retail case from unresolved relationships | Case actions → same case anchor |
| Closing CTA | Invite a relevant enquiry | Contact CrimsonTide → intended `/contact` |

No application page, filter, carousel, expanded case dialog, or hidden proof detail is established. The preview's same-anchor case action adds no content; changing that behavior remains pending. Proposed adaptation makes a sticky case index static before its details on smaller screens. Labels and proof remain readable without hover. Sector relevance does not prove complete industry coverage; logos and illustrated metrics do not prove results. No local dismissal or special return flow is demonstrated.

## Company — `/company`

Need: understand CrimsonTide beyond an individual product. Outcome: connect purpose, proprietary development, tailored work, and origin to an enquiry.

| Sequence | Purpose and relationship | Actions |
| --- | --- | --- |
| Hero | Introduce identity and direction | Discover CrimsonTide → intended `#company-about` |
| About CrimsonTide | Proprietary technology, work around context, carrying ideas into use | Three principles; reading progression |
| Built in Jamaica | Origin and regional context with global potential | Section, not a separate route |
| Closing CTA | Invite an opportunity or technology conversation | Contact CrimsonTide → intended `/contact` |

No application page exists. The repeated About CrimsonTide eyebrow is working copy, not proof of accepted repetition. Team/Insights have no corresponding content. Jamaica media is atmospheric; removing it must not remove the proposition. Proposed narrow-screen adaptation retains text and principles without requiring radial geometry or hover. No tabs, dialogs, or special return/dismissal behavior is established.

## Contact — `/contact`

Need: share a product, solution, partnership, or general enquiry. Outcome: a reliable conversation entry, not yet implemented.

Sequence: hero invitation → support/contact context → form → intended follow-up. In the preview, support precedes the form in document order, and What happens next sits inside that support area. Labels, placeholders, option sets, and follow-up wording belong to Content.

Reference-preview observations:

- Name and Work email are required; email uses native email validity. Organisation, topic, and message have no required attribute. Topic defaults to OpenJM. Final required fields and default selection remain pending for the application.
- Invalid events mark the field `aria-invalid` and set a shared textual status with `role="status"` and `aria-live="polite"`. Valid input removes the field marker; the shared message clears only when the whole form passes `checkValidity()`. That check can itself trigger invalid events. No field-specific error association or scripted error-focus routing is provided.
- There is a submit button but no action, method, or submit handler. Native submission is not a delivery or confirmation integration.
- Sending, accepted, failed delivery, retry, duplicate-submit, and recovery states are undefined. No confirmed delivery or persistence across navigation is demonstrated.

Next.js has no Contact page or API route. Intended keyboard/touch use must preserve labels, errors, and context without hover; Design owns form/support geometry. Recovery that preserves correctable input is proposed direction subject to a receiving contract. Submission destination, privacy/consent decisions, required fields, option set, feedback copy, retry, and navigation-away persistence remain `[Pending validation]`. No booking integration, modal, or automatic enquiry preselection is established.

## Motion, focus, and interruption

Frontend owns the established requirements for repeatable forward/reverse scroll transitions, continuation after interruption, and resolved focused content. Design owns motion values and reduced-motion appearance. Code and preview observations do not override these requirements.

The retained reveal behavior keeps initially visible content resolved and content above the activation threshold resolved even after it leaves above the viewport. New-page and direct-anchor entry should initialize from the actual reading position. These are intended continuity conditions, not a claim that all navigation paths were exercised.

`src/components/ui/Reveal/Reveal.tsx` uses scroll/resize and an untransformed-top threshold near 92% of viewport height; its CSS resolves focused content. The preview instead unobserves each block after its first intersection, so its one-shot reveal differs from the required behavior. `src/components/sections/products/ProductMotion.tsx` pauses illustration activity outside the viewport, while the document is hidden, or under reduced motion. Fine-pointer movement controls tilt and leaving resets it. These observations do not verify every animation stage or pause/resume continuity.

For every intended route, reduced motion preserves content and states while removing decorative movement. Keyboard and touch access must remain complete without hover. Route changes, Back/Forward, interrupted transitions, focused reveals, and input-capability changes require browser evidence during future affected implementation; this documentation rewrite does not establish those outcomes.
