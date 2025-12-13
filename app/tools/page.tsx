import type { Metadata } from "next";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ToolsTable from "@/components/tools";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Discover the tools and software Zakary Fofana uses for design, development, and productivity. Includes code editors, design software, and project management tools.",
  keywords: [
    "Zakary Fofana",
    "tools",
    "software",
    "design tools",
    "development tools",
    "productivity",
  ],
  openGraph: {
    title: "Tools | Zakary Fofana",
    description: "A curated list of tools and software used by Zakary Fofana.",
    url: "https://zakary.dev/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools | Zakary Fofana",
    description:
      "Discover the tools and software Zakary Fofana uses for design, development, and productivity.",
  },
};

export default function Tools() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-10 md:pt-40">
        <TextReveal
          display="block"
          variant="slideDown"
          className="mb-5 font-medium text-lg"
        >
          My tools
        </TextReveal>
        <Reveal display="block" variant="slideUp" className="w-full">
          <ToolsTable />
        </Reveal>
      </div>
      <Footer />
    </Container>
  );
}
