import type { Metadata } from "next";

export const PUBLIC_ORIGIN = "https://crimsontide.ai";
export const SHARE_IMAGE_PATH = "/og/crimsontide-share.png";
export const SHARE_IMAGE_ALT =
  "CrimsonTide — AI software company, built in Jamaica.";

export const publicRoutes = [
  "/",
  "/products",
  "/solutions",
  "/work",
  "/company",
  "/contact",
] as const;

export type PublicRoute = (typeof publicRoutes)[number];

type SeoRecord = {
  title: string;
  description: string;
};

export const seoRecords: Record<PublicRoute, SeoRecord> = {
  "/": {
    title: "AI Software Company in Jamaica | CrimsonTide",
    description:
      "CrimsonTide is an AI software company in Jamaica developing proprietary products, AI solutions, and custom software for organisations.",
  },
  "/products": {
    title: "Conversational AI & Computer Vision Products | CrimsonTide",
    description:
      "Explore OpenJM conversational AI and Sentinel computer vision products, independently developed by CrimsonTide for different needs.",
  },
  "/solutions": {
    title: "AI Solutions & Custom Software Development | CrimsonTide",
    description:
      "CrimsonTide designs AI solutions and custom software development engagements around an organisation's objectives, context, and operations.",
  },
  "/work": {
    title: "AI Software Experience & Case Studies | CrimsonTide",
    description:
      "Explore CrimsonTide's AI software experience, documented case studies, sector relevance, and client relationships.",
  },
  "/company": {
    title: "Jamaica-Built AI Software Company | CrimsonTide",
    description:
      "Learn about CrimsonTide, a Jamaica-built AI software company developing proprietary products, AI solutions, and custom software.",
  },
  "/contact": {
    title: "AI & Custom Software Project Enquiries | CrimsonTide",
    description:
      "Start a conversation with CrimsonTide about an AI solution, custom software project, product, integration, or partnership.",
  },
};

export function absoluteUrl(path: string): string {
  return `${PUBLIC_ORIGIN}${path === "/" ? "" : path}`;
}

export function getPageMetadata(path: PublicRoute): Metadata {
  const { title, description } = seoRecords[path];
  const url = absoluteUrl(path);
  const image = absoluteUrl(SHARE_IMAGE_PATH);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "CrimsonTide",
      locale: "en_JM",
      images: [{ url: image, width: 1200, height: 630, alt: SHARE_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: SHARE_IMAGE_ALT }],
    },
  };
}

export const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organisation",
    "@id": `${PUBLIC_ORIGIN}/#organisation`,
    name: "CrimsonTide",
    legalName: "CrimsonTide AI Limited",
    url: PUBLIC_ORIGIN,
    email: "info@crimsontide.ai",
    telephone: "+1-876-458-4187",
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "53 Lady Musgrave Road, Pinnacle Pointe, Unit #3",
        addressLocality: "Kingston 8",
        addressCountry: "JM",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "279 Poinciana Drive, Greenwood",
        addressRegion: "St. James",
        addressCountry: "JM",
      },
    ],
    sameAs: [
      "https://www.instagram.com/crimsontide.ai/",
      "https://www.youtube.com/@CrimsonTideAI",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${PUBLIC_ORIGIN}/#website`,
    name: "CrimsonTide",
    url: PUBLIC_ORIGIN,
    inLanguage: "en-JM",
    publisher: { "@id": `${PUBLIC_ORIGIN}/#organisation` },
  },
] as const;
