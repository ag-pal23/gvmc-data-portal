import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/organisms/NavBar/NavBar";

export const metadata: Metadata = {
  title: "GVMC Open Data Intelligence Platform",
  description: "Unlock Visakhapatnam's civic data. Explore datasets, interactive maps, AI-powered insights, analytics, and predictions for smarter governance.",
  keywords: "GVMC, Visakhapatnam, open data, civic data, analytics, AI, smart city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
