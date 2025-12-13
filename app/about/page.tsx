import Announcement from "@/components/annoucement";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";

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
          className="mb-20 font-normal text-muted-foreground text-base"
        >
          My name is Zakary, I am a 18 years old design technologist and
          software developer based in Montreal, Canada. I create designs that
          feel <b className="text-primary font-medium">natural</b>, fluid, and
          intuitive. I am specialized in Typescript.
        </Reveal>
        <TextReveal
          display="block"
          variant="slideUp"
          className="mb-5 font-medium text-lg"
        >
          Why?
        </TextReveal>
        <Reveal
          display="block"
          variant="slideDown"
          className="mb-20 font-normal text-muted-foreground text-base"
        >
          Put simply: “
          <b className="text-primary font-medium">
            A great interface fades away, leaving only the experience.
          </b>
          ”
        </Reveal>

        <TextReveal variant="slideUp" className="mb-5 font-medium text-lg">
          Accept it or not
        </TextReveal>
        <Reveal
          display="block"
          variant="slideDown"
          className="mb-5 font-normal text-muted-foreground text-base"
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
