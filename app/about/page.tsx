import Announcement from "@/components/annoucement";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import { getAge } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Zakary Fofana - Full-stack engineer, Design enthusiast, and entrepreneur. Co-founder of LocalCard and Measurely, building minimalist platforms with Next.js, React, and TypeScript.",
  keywords: [
    "Zakary Fofana",
    "about",
    "developer",
    "entrepreneur",
    "full-stack engineer",
    "design enthusiast",
    "business administration",
    "Montreal developer",
  ],
  openGraph: {
    title: "About | Zakary Fofana",
    description:
      "Learn about Zakary Fofana - Full-stack engineer, Design enthusiast.",
    url: "https://zakary.dev/about",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Zakary Fofana",
    description:
      "Learn about Zakary Fofana - Full-stack engineer, Design enthusiast, and entrepreneur.",
  },
};
export default function About() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-[calc(160px-40px-68px)]">
        <Announcement />
        <TextReveal
          display="block"
          variant="slideUp"
          className="mb-5 font-medium text-lg"
        >
          What?
        </TextReveal>
        <Reveal
          display="block"
          variant="slideDown"
          className="mb-20 font-normal text-muted-foreground text-base text-justify"
          staggerDelay={0.001}
        >
          {`My name is Zakary, I am an ${getAge(2007, 9, 13)} years old Full-stack engineer and Design enthusiast based in Montreal, Canada. I create designs that feel natural, fluid, and intuitive. I am specialized in Typescript.`}
        </Reveal>
        <TextReveal
          display="block"
          variant="slideUp"
          className="mb-5 font-medium text-lg"
        >
          Why?
        </TextReveal>
        <Reveal display="block" variant="slideDown" className="mb-20">
          <span className="font-normal text-muted-foreground text-base text-justify">
            Put simply:{" "}
            <b className="text-primary font-medium">
              “A great interface fades away, leaving only the experience.”
            </b>
          </span>
        </Reveal>

        <TextReveal variant="slideUp" className="mb-5 font-medium text-lg">
          Accept it or not
        </TextReveal>
        <Reveal
          display="block"
          variant="slideDown"
          className="mb-5 font-normal text-muted-foreground text-base text-justify"
        >
          Design is power. It shapes perception and influences decisions. A bad
          product with great UX can thrive, but a great product with bad UX will
          fail. I design for impact.
        </Reveal>
      </div>
      <Footer />
    </Container>
  );
}
