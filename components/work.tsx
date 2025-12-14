"use client";
import Link from "next/link";
import { work as projects, type Work as WorkType } from "@/data/work";
import { cn } from "@/lib/utils";
import * as ButtonModule from "./ui/button/button";
import * as CardModule from "./ui/card/card";
import * as CarouselModule from "./ui/carousel/carousel";
import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";

// biome-ignore lint/suspicious/noExplicitAny: This is a generic resolver.
function resolve(module: { [key: string]: any }, name?: string) {
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
const CardContent = resolve(CardModule, "CardContent");
const CardFooter = resolve(CardModule, "CardFooter");

const Button = resolve(ButtonModule, "Button");

export default function Work() {
  return (
    <div className="mt-32">
      <TextReveal
        delay={1.2}
        variant="slideDown"
        className="mb-5 font-medium text-lg"
      >
        My projects
      </TextReveal>
      <Carousel.Bleed>
        <Carousel.Root
          align="start"
          gap={8}
          totalItems={projects.length}
          variant="inset"
        >
          <Carousel.Viewport>
            <Carousel.Content>
              {projects.map((project: WorkType, index: number) => (
                <Carousel.Item index={index} key={project.id}>
                  <Reveal variant="slideUp" startOnView={false} delay={1.2}>
                    <Card
                      onClick={() => window.open(project.url, "_self")}
                      className="h-full max-w-90"
                      variant="lift"
                    >
                      <div
                        className={cn(
                          "box-border w-full max-w-none",
                          "-mt-6.25 -mx-6.25 mb-0 h-75 w-[calc(100%+3rem+2px)] max-w-[100vw]",
                          "transition-transform duration-250 ease-in-out-quad",
                        )}
                      >
                        {project.showcase}
                      </div>
                      <CardContent>
                        <CardTitle className="m-0 max-sm:text-[1.125rem] max-sm:leading-[1.3] font-serif text-2xl">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="mt-0">
                          {project.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter>
                        <Link href={project.url}>
                          <Button size="sm" variant="outline">
                            {project.id === "maybe-you"
                              ? "Contact Me"
                              : "Learn More"}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </Reveal>
                </Carousel.Item>
              ))}
            </Carousel.Content>
          </Carousel.Viewport>
          <Reveal
            display="block"
            variant="slideUp"
            startOnView={false}
            delay={1.2}
          >
            <Carousel.Navigation>
              <Carousel.Previous />
              <Carousel.Next />
            </Carousel.Navigation>
          </Reveal>
        </Carousel.Root>
      </Carousel.Bleed>
    </div>
  );
}
