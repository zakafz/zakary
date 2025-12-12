import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Badge, BadgeIcon } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { LinkedIn } from "@/components/ui/linkedin-icon";
import Work from "@/components/work";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <Header />
      <div className="pt-40 flex flex-col">
        <Link target="_blank" href="https://openpolicyhq.com">
          <Badge size={"md"} variant={"outline"} className="cursor-pointer">
            OpenPolicy is now live{" "}
            <BadgeIcon className="mr-0 ml-0.5">
              <ArrowRight className="size-3" />
            </BadgeIcon>
          </Badge>
        </Link>
        <div className="mt-6 text-5xl font-medium">
          <span className="italic">Zakary</span>{" "}
          <span className="font-mono">Fofana</span>
        </div>
        <div className="mt-5 text-muted-foreground max-w-4xl">
          Full-stack engineer, and self proclaimed design enthusiast.
          Specialized in Typescript, Next.js, Tailwind, Tauri and Electron.
          Based in Montréal, Canada.
        </div>
        <div className="flex gap-4 mt-6">
          <Link href="/contact">
            <Button>Contact me</Button>
          </Link>
          <Link href="https://linkedin.com/in/zakary-fofana" target="_blank">
            <Button
              className="aspect-square"
              variant={"outline"}
            >
              <LinkedIn className="size-4.5 shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
      <Work />
      <Footer />
    </Container>
  );
}
