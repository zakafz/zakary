import Announcement from "@/components/annoucement";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ToolsTable from "@/components/tools";

export default function Tools() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-40">
        <div className="mb-5 font-medium text-lg">My tools</div>
        <ToolsTable />
      </div>
      <Footer />
    </Container>
  );
}
