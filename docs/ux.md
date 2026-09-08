# Experience Context

## Status

- **Classification:** context. This document records the information architecture, journeys, page objectives, and writing direction required to interpret and execute CrimsontideAI website work. It is not normative. It does not override `AGENTS.md`, `CLAUDE.md`, or any document in `AGENTS/roles/`.
- **Related context:** `docs/product.md` (company and product truth), `docs/content.md` (approved copy), `docs/structure.md` (composition), `docs/design.md` (visual language).
- **Unresolved items** are marked `[Pending validation]`. Do not resolve them by inference.

## Core transformation

The previous website led with products and capabilities, then explained the company. The new website reverses this:

> CrimsonTide → explains who it is → presents what it builds → presents its products → presents its solutions → demonstrates experience → builds trust → leads to contact

This ordering governs content, UX, UX writing, information architecture, design, marketing, and development.

## UX principles

1. CrimsonTide must be understood before its products.
2. Products must preserve their independence.
3. Products and solutions must be two clearly different paths.
4. The company must demonstrate experience before asking for contact.
5. Product details should live in their own product experiences.
6. Do not repeat the previous architecture based on mixed capability pages.
7. Reduce technical jargon in the first layers.
8. Allow progressive depth.
9. Maintain a clear path toward contact.
10. Use real evidence.
11. Avoid audience overload on a single page.
12. Keep Jamaica present without allowing it to dominate the whole narrative.

## Information architecture

```text
Home
|
+-- Products
|   +-- Product Portfolio          /products
|   +-- OpenJM                     /products/openjm
|   +-- Sentinel                   /products/sentinel
|
+-- AI Solutions
|   +-- AI Solutions               /solutions/ai-solutions
|   +-- Custom Software Development /solutions/software-development
|   +-- Product Customisation      /solutions/product-customisation
|   +-- Integrations & Deployments /solutions/integrations-deployments
|
+-- Work & Credibility
|   +-- Case Studies               /work/case-studies
|   +-- Industries                 /work/industries
|   +-- Clients & Partnerships     /work/clients-partnerships
|
+-- Company
|   +-- About CrimsonTide          /company/about
|   +-- Built in Jamaica           /company/built-in-jamaica
|   +-- Team                       /company/team
|   +-- Insights                   /company/insights
|
+-- Contact
|   +-- Contact Us                 /contact
|   +-- Book a Consultation        /contact/consultation
|   +-- Product Enquiry            /contact/product-enquiry
|
+-- Utility
    +-- Privacy                    /privacy
    +-- Terms                      /terms
    +-- Support                    /support
```

The `/products` index route is inferred from the portfolio page's position in the architecture; the master document states the page but not its route. The `/products/openjm` and `/products/sentinel` routes are marked "proposed" in the source. `/support` is marked proposed and pending confirmation on whether it needs its own page at all — it may function only as a router toward OpenJM Support, Sentinel Support, and corporate enquiries.

## Primary navigation

Top navigation: **Products · Solutions · Work · Company · Contact**

Highlighted CTA: **Contact CrimsonTide**. Recorded alternative: _Talk to our team_. Final choice depends on brand tone and is `[Pending validation]`.

There must never be multiple competing primary CTAs.

## Navigation journeys

| Visitor                  | Journey                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| Looking for a product    | Home → Products → OpenJM / Sentinel → Product experience                   |
| Company with a problem   | Home → Solutions → AI Solution / Custom Software → Case Study → Contact    |
| Wants to adapt a product | Home → Products → OpenJM / Sentinel → Product Customisation → Consultation |
| Validating credibility   | Home → Work → Case Studies / Clients → Company → Contact                   |
| Talent / partner / press | Home → Company → Team / Insights / Built in Jamaica → Contact              |

## Page objectives

### Home

Explain within a few seconds: what CrimsonTide is; what it builds; which products it has; what type of solutions it develops; why the company can be trusted; how to start a conversation.

Section order: Hero → What we build (two paths) → Products (OpenJM, Sentinel) → Solutions (four) → Proof / Experience → Company (Jamaica, team, track record) → Final CTA.

Narrative direction: CrimsonTide → We build → Our products → Solutions → Work → Company → CTA.

### Products — `/products`

Present the portfolio **without merging the products**.

- OpenJM summary: AI platform; productivity; conversation; files; personal/professional/business use. CTA _Explore OpenJM_.
- Sentinel summary: computer vision; security; monitoring; operations; CCTV/IP cameras. CTA _Explore Sentinel_.

**Rule:** do not use a feature-comparison table. The products do not compete. Compare them only by _the problem they solve_.

### OpenJM within CrimsonTide — `/products/openjm`

Acts as a corporate bridge toward the product. Covers what OpenJM is, who can use it, main use cases, created in Jamaica, globally available, its relationship with CrimsonTide, and a link to the OpenJM landing page/app.

Do not duplicate: complete pricing, all FAQs, all benefits, all limits, onboarding, or the entire product landing page.

### Sentinel within CrimsonTide — `/products/sentinel`

Acts as a corporate bridge toward Sentinel. Covers what Sentinel is, the problem it solves, CCTV/IP cameras, computer vision, security + operations, representative industries, relevant evidence, and a link to Sentinel's own experience.

Do not duplicate: the complete model catalogue, every industry, full technical pages, or all commercial calls to action.

### AI Solutions — `/solutions/ai-solutions`

Explain that CrimsonTide can develop AI solutions outside its standard products. Covers business problems, discovery, solution design, applied AI, prototyping, implementation, integration, evolution. CTA _Discuss an AI solution_.

### Custom Software Development — `/solutions/software-development`

Make clear that CrimsonTide is a software company, not only an AI model company. Covers digital products, platforms, applications, systems, discovery, design, development, integration, AI when it adds value, implementation. CTA _Discuss a software project_.

### Product Customisation — `/solutions/product-customisation`

Explain that CrimsonTide products can be adapted to specific needs. Covers configuration, integration, workflows, customised experiences, adaptations, specific deployments. CTA _Request a product adaptation_.

**Warning:** specific capabilities must be validated by product, by client, and by project.

### Integrations & Deployments — `/solutions/integrations-deployments`

Explain the ability to support technical and operational implementation. Covers configuration, integration with systems, go-live, deployment, adoption support, optimisation where relevant.

### Work & Credibility

This area replaces the previous logic of using industry and technology pages as implicit proof. It presents explicit evidence.

- **Case Studies** — `/work/case-studies`. The General Food Supermarket (Liguanea) case is the current public asset. A case may only be attributed to a specific product when evidence confirms it.
- **Industries** — `/work/industries`. Show experience and sector relevance through real experience, cases, relevant products, and possible solutions. These sectors are strongly associated with Sentinel and must not be presented as the entirety of CrimsonTide's industries.
- **Clients & Partnerships** — `/work/clients-partnerships`. Do not reduce this to a wall of logos. Where possible include type of relationship, project, sector, result, and related case.

### Company

- **About CrimsonTide** — `/company/about`. Must answer _who is CrimsonTide_ without first mentioning the features of Sentinel or OpenJM. Covers the reference statement, proprietary products, custom software, AI solutions, adaptation capability, vision, purpose, experience, origin, track record, technological ownership, and regional focus with global capability.
- **Built in Jamaica** — `/company/built-in-jamaica`. Develops origin as corporate identity: origin story, building technology in Jamaica, local innovation, talent, vision for the Caribbean, global ambition, impact, photography, people, business context. **Avoid:** excessive dependence on the flag, tourism aesthetics, clichés, and turning "Jamaica" into a substitute for the value proposition.
- **Team** — `/company/team`. The previous website lists Jon-Paul Morrison, Carlene Sinclair, Brittany Lyons, Daniel Darville, Bradley Delapenha, Andrew Lattibeaudiere, Leanne Talbot, and Jezeel Martin. Before publication the source requires confirming current members and roles, resolving inconsistencies between pages, and deciding who appears publicly. Treat the entire roster as `[Pending validation]`.
- **Insights** — `/company/insights`. Evolves the blog into a corporate space: news, launches, product, artificial intelligence, software, cases, events, business vision, innovation from Jamaica, and technical content where relevant.

### Contact

- **Contact Us** — `/contact`. The primary corporate conversion point. Form fields and enquiry types are defined by the approved copy in `docs/content.md`; see the conflict note there.
- **Book a Consultation** — `/contact/consultation`. Objective: start a commercial conversation about a specific need. May be a simple page, a specialised form, a modal, or a booking system, depending on available technical capability. `[Pending validation]`
- **Product Enquiry** — `/contact/product-enquiry`. Separates corporate from product enquiries. Product selector: OpenJM, Sentinel. Reason selector: Demo, Product information, Business deployment, Customisation, Integration, Other.

### Legal & support

- **Privacy** — `/privacy`. Covers the corporate website, forms, and contact data. OpenJM and Sentinel may require their own policies.
- **Terms** — `/terms`. Distinguishes corporate terms from product terms.
- **Support** — `/support`. `[Pending validation]` — see the architecture note above.

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
- having multiple competing primary CTAs.
