"use client";
import { work as workData } from "@/data/work";
import { useParams } from "next/navigation";
import { Badge } from "./ui/badge/badge";
import Link from "next/link";
import { Button } from "./ui/button/button";
import Image from "next/image";
import { Globe } from "lucide-react";
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
  return (
    <TooltipProvider>
      <div>
        {work ? (
          <div className="grid grid-cols-2 gap-10">
            <div className="sticky top-5 self-start">
              <Image
                className="w-full border-[0.5px] border-border/70"
                src={work.image || '/openpolicy.png'}
                alt={work.title}
                width={3000}
                height={3000}
              />
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-medium flex justify-between items-center">
                {work.title}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link href={work.website || 'https://zakary.dev'} target="_blank">
                        <Button variant={"ghost"} className="aspect-square">
                          <Globe className="size-4.5 shrink-0" />
                        </Button>
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
            </div>
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
