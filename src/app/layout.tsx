import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { PUBLIC_ORIGIN, seoRecords, structuredData } from "@/lib/seo";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
