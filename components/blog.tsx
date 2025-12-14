import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./ui/reveal";

export default function BlogSection() {
  const posts = [
    {
      date: "12/12/2025",
      title: "Making OpenPolicy",
      description: "Why and how I built OpenPolicy in 3 weeks. ALONE.",
      url: "https://blog.zakary.dev/blog-2",
      image: "/blog-2.webp",
    },
    {
      date: "02/04/2025",
      title: "Measurely goes open source",
      description:
        "Why Measurely is now open source and how this move empowers developers to innovate, collaborate, and trust the platform.",
      url: "https://blog.zakary.dev/blog-1",
      image: "/blog-1.png",
    },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {posts.map((post) => (
        <Link href={post.url} key={post.title}>
          <Reveal variant="slideUp">
            <div className="group flex cursor-pointer flex-col border-[0.5px] border-border/80 bg-(--mix-card-33-bg) duration-200">
              <div className="flex flex-col p-4">
                <div className="flex w-full items-center justify-between">
                  <div className="font-medium">{post.title}</div>
                  <div className="font-mono text-muted-foreground text-sm">
                    {post.date}
                  </div>
                </div>
                <div className="mt-2 text-muted-foreground text-sm">
                  {post.description}
                </div>
              </div>
              <div className="px-2 pb-2">
                <Image
                  alt="Post Image"
                  className="w-full border-[0.5px] border-border grayscale duration-200"
                  draggable={false}
                  height={3500}
                  src={post.image}
                  width={4000}
                />
              </div>
            </div>
          </Reveal>
        </Link>
      ))}
    </div>
  );
}
