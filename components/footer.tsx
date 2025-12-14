import { Send } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button/button";
import { GitHub } from "./ui/github-icon";
import { LinkedIn } from "./ui/linkedin-icon";
import { Separator } from "./ui/separator/separator";

export default function Footer() {
  return (
    <div className="mt-20 flex w-full items-center justify-between border-border/70 border-t pt-5 pb-8">
      <div className="font-mono text-muted-foreground text-xs">
        <span className="max-md:hidden">All rights reserved</span> &copy;{" "}
        {new Date().getFullYear()} Zakary Fofana
      </div>
      <div className="flex items-center gap-2">
        <Link href="https://github.com/zakafz/" target="_blank">
          <Button className="aspect-square" variant={"ghost"}>
            <GitHub className="size-4.5 shrink-0" />
          </Button>
        </Link>

        <Separator className={"h-5!"} orientation="vertical" />

        <Link href="https://www.linkedin.com/in/zakary-fofana/" target="_blank">
          <Button className="aspect-square" variant={"ghost"}>
            <LinkedIn className="size-4.5 shrink-0" />
          </Button>
        </Link>

        <Separator className={"h-5!"} orientation="vertical" />

        <Link href="mailto:hello@zakary.dev">
          <Button className="aspect-square" variant={"ghost"}>
            <Send className="size-4.5 shrink-0" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
