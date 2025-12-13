import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ToolsTable from "@/components/tools";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";

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
