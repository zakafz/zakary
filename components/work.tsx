"use client";
import Link from "next/link";
import { work as projects, type Work as WorkType } from "@/data/work";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card/card";
import { Carousel } from "./ui/carousel/carousel";
import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";

export default function Work() {
  return (
    <div className="mt-32">
      <TextReveal
        className="mb-5 font-medium text-lg"
        delay={1.2}
        variant="slideDown"
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
                  <Reveal delay={1.2} startOnView={false} variant="slideUp">
                    <Card
                      className="h-full max-w-90"
                      onClick={() => window.open(project.url, "_self")}
                      variant="lift"
                    >
                      <div
                        className={cn(
                          "box-border w-full max-w-none",
                          "-mt-6.25 -mx-6.25 mb-0 h-75 w-[calc(100%+3rem+2px)] max-w-[100vw]",
                          "transition-transform duration-250 ease-in-out-quad"
                        )}
                      >
                        {project.showcase}
                      </div>
                      <CardContent>
                        <CardTitle className="m-0 font-serif text-2xl!">
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
            delay={1.2}
            display="block"
            startOnView={false}
            variant="slideUp"
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
