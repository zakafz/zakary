import Announcement from "@/components/annoucement";
import BlogSection from "@/components/blog";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { TextReveal } from "@/components/ui/text-reveal";

export default function Blog() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-[calc(160px-40px-68px)]">
        <Announcement />
        <TextReveal variant="slideDown" className="mb-5 font-medium text-lg">
          My blog
        </TextReveal>
        <BlogSection />
      </div>
      <Footer />
    </Container>
  );
}
