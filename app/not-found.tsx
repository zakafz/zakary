import Link from "next/link";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";

export default function NotFound() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-40">
        <div className="flex flex-col">
          <Badge size={"lg"} variant={"outline"}>
            404
          </Badge>
          <div className="mt-6 font-medium text-5xl">I think you're lost</div>
          <div className="mt-5 max-w-3xl text-muted-foreground">
            Looking for the contact page? Don't worry, I'm here to help. Just
            click the button below to go home or to get in touch.
          </div>
          <div className="mt-6 flex gap-4">
            <Link href="/">
              <Button>Home</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </Container>
  );
}
