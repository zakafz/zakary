import Announcement from "@/components/annoucement";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { getAge } from "@/lib/utils";

export default function About() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-[calc(160px-40px-68px)]">
        <Announcement />
        <div className="mb-5 font-medium text-lg">What</div>
        <div className="mb-20 font-normal text-muted-foreground text-base">
          My name is Zakary, I am a {getAge(2007, 8, 13)} years old design technologist and software developer based
          in Montreal, Canada. I create designs that feel{" "}
          <b className="text-primary font-medium">natural</b>, fluid, and
          intuitive. I am specialized in Typescript.
        </div>
        <div className="mb-5 font-medium text-lg">Why</div>
        <div className="mb-20 font-normal text-muted-foreground text-base">
          Put simply: “
          <b className="text-primary font-medium">
            A great interface fades away, leaving only the experience.
          </b>
          ”
        </div>

        <div className="mb-5 font-medium text-lg">Accept it or not</div>
        <div className="mb-5 font-normal text-muted-foreground text-base">
          Design is power. It shapes perception and influences decisions. A bad
          product with great UX can thrive, but a great product with bad UX will
          fail. I design for impact.
        </div>
      </div>
      <Footer />
    </Container>
  );
}
