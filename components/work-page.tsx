"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Work, work as workData } from "@/data/work";
import { Badge } from "./ui/badge/badge";
import { Button } from "./ui/button/button";
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
  const work = workData.find((work) => work.id === id);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Reveal variant="blur" className="lg:sticky top-5 self-start">
              <Image
                className="w-full border-[0.5px] border-border/70"
                src={work.image || "/openpolicy.png"}
                alt={work.title}
                width={3000}
                height={3000}
              />
            </Reveal>
            <Reveal variant="blur" className="flex flex-col">
              <div className="text-2xl font-medium flex justify-between items-center">
                <TextReveal variant="slideDown">{work.title}</TextReveal>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={work.website || "https://zakary.dev"}
                        target="_blank"
                      >
                        <Reveal variant="slideDown">
                          <Button variant={"ghost"} className="aspect-square">
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
                        onClick={handleScrollToTop}
                        variant={"outline"}
                        className="aspect-square"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="size-4.5 shrink-0"
                          viewBox="0 0 512 512"
                        >
                          <title>Scroll to top</title>
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="square"
                            strokeMiterlimit="10"
                            strokeWidth="48"
                            d="M112 244l144-144 144 144M256 120v292"
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

                {nextProject && (
                  <Link href={nextProject.url}>
                    <Button variant="outline" className="pr-2.5">
                      {nextProject.title}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 ml-2"
                        viewBox="0 0 512 512"
                      >
                        <title>Next project</title>
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="square"
                          strokeMiterlimit="10"
                          strokeWidth="48"
                          d="M184 112l144 144-144 144"
                        />
                      </svg>
                    </Button>
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="flex flex-col">
            <Badge size={"lg"} variant={"outline"}>
              404
            </Badge>
            <div className="mt-6 text-5xl font-medium">
              Can't seem to find this work
            </div>
            <div className="mt-5 text-muted-foreground max-w-4xl">
              Maybe its a sign, contact me
            </div>
            <div className="flex gap-4 mt-6">
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
