import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { PUBLIC_ORIGIN, seoRecords, structuredData } from "@/lib/seo";
import "./globals.css";

const roboto = localFont({
  src: [
    {
      path: "./fonts/Roboto[wdth,wght].ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/Roboto-Italic[wdth,wght].ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_ORIGIN),
  title: seoRecords["/"].title,
  description: seoRecords["/"].description,
};

export const viewport: Viewport = { themeColor: "#07090D" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={roboto.variable}>
    <body>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <SiteNavigation>{children}</SiteNavigation>
    </body>
  </html>;
}
