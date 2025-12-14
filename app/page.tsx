import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Badge, BadgeIcon } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { GitHub } from "@/components/ui/github-icon";
import { LinkedIn } from "@/components/ui/linkedin-icon";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import Work from "@/components/work";

export default function Home() {
  return (
    <Container>
      <Header />
      <div className="flex flex-col pt-20 md:pt-40">
        <Reveal delay={1} variant="slideUp">
          <Link href="https://openpolicyhq.com" target="_blank">
            <Badge className="cursor-pointer" size={"md"} variant={"outline"}>
              OpenPolicy is now live{" "}
              <BadgeIcon className="mr-0 ml-0.5">
                <ArrowRight className="size-3" />
              </BadgeIcon>
            </Badge>
          </Link>
        </Reveal>

        <div className="mt-6 font-medium font-serif text-5xl">
          <TextReveal className="italic leading-13" variant="slideUp">
            Zakary
          </TextReveal>{" "}
          <TextReveal className="leading-13" delay={0.2} variant="slideUp">
            Fofana
          </TextReveal>
        </div>
        <Reveal
          className="mt-3 max-w-4xl text-justify text-muted-foreground"
          delay={0.5}
          staggerDelay={0.003}
          variant="slideDown"
        >
          Full-stack engineer, and self proclaimed design enthusiast.
          Specialized in Typescript, Next.js, Tailwind, Tauri and Electron.
          Based in Montréal, Canada.
        </Reveal>
        <Reveal className="mt-6 flex gap-4" delay={1} variant="slideUp">
          <Link href="/contact">
            <Button>Contact me</Button>
          </Link>
          <Link href="https://linkedin.com/in/zakary-fofana" target="_blank">
            <Button className="aspect-square" variant={"outline"}>
              <LinkedIn className="size-4.5 shrink-0" />
            </Button>
          </Link>
          <Link
            className="md:hidden"
            href="https://github.com/zakafz"
            target="_blank"
          >
            <Button className="aspect-square" variant={"outline"}>
              <GitHub className="size-4.5 shrink-0" />
            </Button>
          </Link>
        </Reveal>
      </div>
      <Work />
      <Footer />
    </Container>
  );
}
