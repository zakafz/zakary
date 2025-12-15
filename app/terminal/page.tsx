import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import FakeTerminal from "@/components/terminal";

export default function TerminalPage() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-[calc(160px-40px-68px)]">
        <FakeTerminal />
      </div>
      <Footer />
    </Container>
  );
}
