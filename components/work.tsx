import Image from "next/image";
import Link from "next/link";
import * as ButtonModule from "./ui/button/button";
import * as CardModule from "./ui/card/card";
import * as CarouselModule from "./ui/carousel/carousel";

function resolve(module: any, name?: string) {
  if (!module) return undefined;
  if (name) {
    return module[name] ?? module.default?.[name] ?? module.default ?? module;
  }
  return module.default ?? module;
}

const Carousel = {
  Bleed: resolve(CarouselModule, "Bleed"),
  Root: resolve(CarouselModule, "Root"),
  Viewport: resolve(CarouselModule, "Viewport"),
  Content: resolve(CarouselModule, "Content"),
  Item: resolve(CarouselModule, "Item"),
  Navigation: resolve(CarouselModule, "Navigation"),
  Previous: resolve(CarouselModule, "Previous"),
  Next: resolve(CarouselModule, "Next"),
};

const Card = resolve(CardModule, "Card");
const CardTitle = resolve(CardModule, "CardTitle");
const CardDescription = resolve(CardModule, "CardDescription");
const _CardImage = resolve(CardModule, "CardImage");
const CardContent = resolve(CardModule, "CardContent");
const CardFooter = resolve(CardModule, "CardFooter");

const Button = resolve(ButtonModule, "Button");

export default function Work() {
  const work = [
    {
      id: "openpolicy",
      image: "/openpolicy-2.png",
      title: "OpenPolicy",
      description: "Write, host, and manage your public documents.",
      url: "/openpolicy",
    },
    {
      id: "localcard",
      image: "/localcard.png",
      title: "LocalCard",
      description:
        "A simple, web‑based loyalty tool that replaces paper punch cards for local businesses.",
      url: "/localcard",
    },
    {
      id: "measurely",
      image: "/measurely-2.png",
      title: "Measurely",
      description:
        "Measurely is a tool that helps developers and teams track metrics, and analyze data.",
      url: "/measurely",
    },
    {
      id: "maybe-you",
      image: "/question-mark.png",
      title: "Have something in mind?",
      description: "Contact me for any project or idea that you have in mind.",
      url: "mailto:hello@zakary.dev",
    },
  ];
  return (
    <div className="mt-32">
      <div className="mb-5 font-medium text-lg"> My projects</div>
      <Carousel.Bleed>
        <Carousel.Root
          align="start"
          className="max-sm:-ml-[10vw]"
          gap={8}
          totalItems={work.length}
          variant="inset"
        >
          <Carousel.Viewport>
            <Carousel.Content>
              {work.map((work, index) => (
                <Carousel.Item index={index} key={work.id}>
                  <Card className="max-w-full sm:max-w-90" variant="lift">
                    <div className="h-75">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          alt={work.title}
                          className="w-50"
                          src={work.image}
                          width={300}
                          height={300}
                        />
                      </div>
                    </div>
                    <CardContent>
                      <CardTitle className="m-0 max-sm:text-[1.125rem] max-sm:leading-[1.3]">
                        {work.title}
                      </CardTitle>
                      <CardDescription className="mt-0">
                        {work.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Link href={work.url} target="_blank">
                        <Button size="sm" variant="outline">
                          {work.id === "maybe-you"
                            ? "Contact Me"
                            : "Learn More"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </Carousel.Item>
              ))}
            </Carousel.Content>
          </Carousel.Viewport>
          <Carousel.Navigation>
            <Carousel.Previous />
            <Carousel.Next />
          </Carousel.Navigation>
        </Carousel.Root>
      </Carousel.Bleed>
    </div>
  );
}
