import type { Metadata } from "next";
import Script from "next/script";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://www.brainyinsights.com'),
  title: {
    default: 'Global Market Research Reports & Consulting',
    template: '%s'
  },
  description: 'The Brainy Insights provides comprehensive market research reports, industry analysis, and consulting services to help businesses grow globally.',
  keywords: ["AI", "Pipeline", "Token Optimization", "GPT-4o mini", "Report Generation"],
  verification: {
    google: "-a-fjg9Wj3dXNQcvPx4v418rK52VsWdjL87OdUWNotU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V78VZDBEHZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-V78VZDBEHZ');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
