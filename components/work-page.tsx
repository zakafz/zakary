"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Work, work as workData } from "@/data/work";
import { Badge } from "./ui/badge/badge";
import { Button } from "./ui/button/button";
import { ImageZoom } from "./ui/image-zoom";
import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip/tooltip";

export default function WorkPage() {
  const { id } = useParams();
  const work = workData.find((w) => w.id === id);

  const projects = workData.filter((p) => p.id !== "maybe-you");
  const currentProjectIndex = projects.findIndex((p) => p.id === id);

  let nextProject: Work | undefined;
  if (currentProjectIndex !== -1) {
    const nextProjectIndex = (currentProjectIndex + 1) % projects.length;
    nextProject = projects[nextProjectIndex];
  } else {
    nextProject = projects[0];
  }

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <TooltipProvider>
      <div>
        {work ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Reveal className="top-5 self-start lg:sticky" variant="blur">
              <ImageZoom zoomMargin={20}>
                <Image
                  alt={work.title}
                  className="w-full border-[0.5px] border-border/70"
                  height={3000}
                  src={work.image || "/openpolicy.png"}
                  width={3000}
                />
              </ImageZoom>
            </Reveal>
            <Reveal className="flex flex-col" variant="blur">
              <div className="flex items-center justify-between font-medium text-3xl">
                <TextReveal className="font-serif" variant="slideDown">
                  {work.title}
                </TextReveal>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={work.website || "https://zakary.dev"}
                        target="_blank"
                      >
                        <Reveal variant="slideDown">
                          <Button className="aspect-square" variant={"ghost"}>
                            <Globe className="size-4.5 shrink-0" />
                          </Button>
                        </Reveal>
                      </Link>
                    }
                  />
                  <TooltipPortal>
                    <TooltipPositioner className="mt-2" side="bottom">
                      <TooltipPopup>
                        <TooltipArrow />
                        Visit website
                      </TooltipPopup>
                    </TooltipPositioner>
                  </TooltipPortal>
                </Tooltip>
              </div>
              <div className="mt-5">{work.content}</div>
              <div className="mt-15 flex justify-between">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        className="aspect-square"
                        onClick={handleScrollToTop}
                        variant={"outline"}
                      >
                        <svg
                          className="size-4.5 shrink-0"
                          viewBox="0 0 512 512"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>Scroll to top</title>
                          <path
                            d="M112 244l144-144 144 144M256 120v292"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="square"
                            strokeMiterlimit="10"
                            strokeWidth="48"
                          />
                        </svg>
                      </Button>
                    }
                  />
                  <TooltipPortal>
                    <TooltipPositioner className="mt-3" side="bottom">
                      <TooltipPopup>
                        <TooltipArrow />
                        Scroll to top
                      </TooltipPopup>
                    </TooltipPositioner>
                  </TooltipPortal>
                </Tooltip>
                {nextProject ? (
                  <Link href={nextProject.url}>
                    <Button className="pr-2.5" variant="outline">
                      {nextProject.title}
                      <svg
                        className="ml-2 size-4"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Next project</title>
                        <path
                          d="M184 112l144 144-144 144"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="square"
                          strokeMiterlimit="10"
                          strokeWidth="48"
                        />
                      </svg>
                    </Button>
                  </Link>
                ) : null}{" "}
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="flex flex-col">
            <Badge size={"lg"} variant={"outline"}>
              404
            </Badge>
            <div className="mt-6 font-medium text-5xl">
              Can't seem to find this work
            </div>
            <div className="mt-5 max-w-4xl text-muted-foreground">
              Maybe its a sign, contact me
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
        )}
      </div>
    </TooltipProvider>
  );
}
