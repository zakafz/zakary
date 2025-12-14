import type { Metadata } from "next";
import Announcement from "@/components/annoucement";
import BlogSection from "@/components/blog";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { TextReveal } from "@/components/ui/text-reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read Zakary Fofana's blog on design, technology, and software development. Insights on Next.js, React, TypeScript, and building user-centric products.",
  keywords: [
    "Zakary Fofana",
    "blog",
    "design",
    "technology",
    "software development",
    "Next.js",
    "React",
    "TypeScript",
  ],
  openGraph: {
    title: "Blog | Zakary Fofana",
    description:
      "Read Zakary Fofana's blog on design, technology, and software development.",
    url: "https://zakary.dev/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Zakary Fofana",
    description:
      "Read Zakary Fofana's blog on design, technology, and software development.",
  },
};

export default function Blog() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-[calc(160px-40px-68px)]">
        <Announcement />
        <TextReveal
          className="mb-5 font-medium text-lg"
          startOnView={false}
          variant="slideDown"
        >
          My blog
        </TextReveal>
        <BlogSection />
      </div>
      <Footer />
    </Container>
  );
}
