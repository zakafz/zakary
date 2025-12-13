import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./ui/reveal";

export default function BlogSection() {
  const posts = [
    {
      date: "12/12/2025",
      title: "Making OpenPolicy",
      description: "Why and how I built OpenPolicy in 3 weeks. ALONE.",
      url: "https://zakary.openpolicyhq.com/blog-1",
      image: "/blog-2.webp",
    },
    {
      date: "02/04/2025",
      title: "Measurely goes open source",
      description:
        "Why Measurely is now open source and how this move empowers developers to innovate, collaborate, and trust the platform.",
      url: "https://zakary.openpolicyhq.com/blog-2",
      image: "/blog-1.png",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-5">
      {posts.map((post) => (
        <Link key={post.title} href={post.url}>
          <Reveal variant="slideUp">
            <div className="group flex flex-col bg-(--mix-card-33-bg) border-[0.5px] border-border/80 cursor-pointer duration-200">
              <div className="p-4 flex flex-col">
                <div className="flex justify-between w-full items-center">
                  <div className="font-medium">{post.title}</div>
                  <div className="font-mono text-muted-foreground text-sm">
                    {post.date}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {post.description}
                </div>
              </div>
              <div className="px-2 pb-2">
                <Image
                  src={post.image}
                  draggable={false}
                  alt="Post Image"
                  className="w-full border-[0.5px] duration-200 grayscale border-border"
                  width={4000}
                  height={3500}
                />
              </div>
            </div>
          </Reveal>
        </Link>
      ))}
    </div>
  );
}
