import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="root flex flex-col items-center">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
