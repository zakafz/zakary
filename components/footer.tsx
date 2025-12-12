import { Send } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button/button";
import { GitHub } from "./ui/github-icon";
import { LinkedIn } from "./ui/linkedin-icon";
import { Separator } from "./ui/separator/separator";

export default function Footer() {
  return (
    <div className="border-t border-border/70 w-full mt-20 pt-5 pb-8 flex justify-between items-center">
      <div className="text-xs font-mono text-muted-foreground">
        All rights reserved &copy; {new Date().getFullYear()} Zakary Fofana
      </div>
      <div className="flex gap-2 items-center">
        <Link href="https://github.com/zakafz/" target="_blank">
          <Button variant={"ghost"} className="aspect-square">
            <GitHub className="size-4.5 shrink-0" />
          </Button>
        </Link>

        <Separator orientation="vertical" className={"h-5!"} />

        <Link href="https://www.linkedin.com/in/zakary-fofana/" target="_blank">
          <Button variant={"ghost"} className="aspect-square">
            <LinkedIn className="size-4.5 shrink-0" />
          </Button>
        </Link>

        <Separator orientation="vertical" className={"h-5!"} />

        <Link href="mailto:hello@zakary.dev">
          <Button variant={"ghost"} className="aspect-square">
            <Send className="size-4.5 shrink-0" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
