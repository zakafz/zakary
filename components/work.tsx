"use client";
import Link from "next/link";
import * as ButtonModule from "./ui/button/button";
import * as CardModule from "./ui/card/card";
import * as CarouselModule from "./ui/carousel/carousel";
import { cn } from "@/lib/utils";
import { work as projects } from "@/data/work";

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
const CardContent = resolve(CardModule, "CardContent");
const CardFooter = resolve(CardModule, "CardFooter");

const Button = resolve(ButtonModule, "Button");

export default function Work() {
  return (
    <div className="mt-32">
      <div className="mb-5 font-medium text-lg">My projects</div>
      <Carousel.Bleed>
        <Carousel.Root
          align="start"
          className="max-sm:-ml-[10vw]"
          gap={8}
          totalItems={projects.length}
          variant="inset"
        >
          <Carousel.Viewport>
            <Carousel.Content>
              {projects.map((project: any, index: number) => (
                <Carousel.Item index={index} key={project.id}>
                  <Card className="max-w-full sm:max-w-90" variant="lift">
                    <div
                      className={cn(
                        "box-border w-full max-w-none",
                        "-mt-6 mx-0 mb-0 h-62.5",
                        "md:-mt-6.25 md:-mx-6.25 md:mb-0 md:h-75 md:w-[calc(100%+3rem+2px)] md:max-w-[100vw]",
                        "transition-transform duration-250 ease-in-out-quad",
                      )}
                    >
                      {project.showcase}
                    </div>
                    <CardContent>
                      <CardTitle className="m-0 max-sm:text-[1.125rem] max-sm:leading-[1.3]">
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
