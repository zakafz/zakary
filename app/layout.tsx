import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zakary.dev"),
  title: {
    template: "%s | Zakary Fofana",
    default: "Zakary Fofana - Full-stack engineer and Design enthusiast",
  },
  description:
    "Full-stack engineer and Design enthusiast in Montreal specializing in minimalist, UX-focused interfaces. Building digital experiences with Next.js, React, and TypeScript.",
  keywords: [
    "Zakary Fofana",
    "full-stack engineer",
    "design enthusiast",
    "software developer",
    "Montreal",
    "Next.js",
    "React",
    "TypeScript",
    "web development",
    "UX design",
  ],
  authors: [
    {
      name: "Zakary Fofana",
      url: "https://www.linkedin.com/in/zakary-fofana/",
    },
  ],
  creator: "Zakary Fofana",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://zakary.dev",
    title: "Zakary Fofana - Full-stack engineer and Design enthusiast",
    description:
      "Full-stack engineer and Design enthusiast in Montreal specializing in minimalist, UX-focused interfaces.",
    siteName: "Zakary Fofana Portfolio",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakary Fofana - Full-stack engineer and Design enthusiast",
    description:
      "Full-stack engineer and Design enthusiast in Montreal specializing in minimalist, UX-focused interfaces.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${geistMono.variable} ${serif.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="root flex flex-col items-center">{children}</div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
