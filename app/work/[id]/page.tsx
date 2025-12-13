import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import WorkPage from "@/components/work-page";

export default function Work() {

  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-40">
        <WorkPage />
      </div>
      <Footer />
    </Container>
  );
}
