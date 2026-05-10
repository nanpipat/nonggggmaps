import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
const thai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PawMap · ค้นหาสถานที่พาน้องเข้าได้ในกรุงเทพฯ",
  description:
    "แผนที่ pet-friendly สำหรับเจ้าของหมาแมว — ค้นหาคาเฟ่ ร้านอาหาร โรงแรม และสวนที่พาน้องเข้าได้จริง พร้อมรีวิวจากชุมชน",
  applicationName: "PawMap",
  keywords: ["pet-friendly", "Bangkok", "dog cafe", "cat cafe", "pet hotel", "petmap"],
  authors: [{ name: "PawMap Team" }],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: undefined,
  openGraph: {
    title: "PawMap · ค้นหาสถานที่พาน้องเข้าได้",
    description: "แผนที่ pet-friendly สำหรับเจ้าของหมาแมวในกรุงเทพฯ",
    locale: "th_TH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFBF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} ${thai.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
