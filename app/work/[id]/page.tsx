import type { Metadata, ResolvingMetadata } from "next";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import WorkPage from "@/components/work-page";
import { workData } from "@/data/work-data";

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = (await params) as unknown as { id: string };
  const work = workData.find((w) => w.id === id);

  if (!work) {
    return {
      title: "Work not found",
      description: "The work you are looking for does not exist.",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: work.title,
    description: work.description,
    openGraph: {
      title: `${work.title} | Zakary Fofana`,
      description: work.description,
      url: `https://zakary.dev/work/${work.id}`,
      images: work.image ? [work.image, ...previousImages] : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${work.title} | Zakary Fofana`,
      description: work.description,
      images: work.image ? [work.image, ...previousImages] : previousImages,
    },
  };
}

export async function generateStaticParams() {
  return workData.map((work) => ({
    id: work.id,
  }));
}

export default function Work() {
  return (
    <Container>
      <Header />
      <div className="min-h-[calc(100vh-56px-80px)] pt-10 lg:pt-40">
        <WorkPage />
      </div>
      <Footer />
    </Container>
  );
}
