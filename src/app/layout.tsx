import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "CrimsonTide", template: "%s — CrimsonTide" },
  description: "CrimsonTide develops proprietary AI products and works with organisations to design, build, adapt, and implement software around specific needs.",
};

export const viewport: Viewport = { themeColor: "#07090D" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={roboto.variable}>
    <body>{children}</body>
  </html>;
}
