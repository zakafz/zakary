import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert/alert";
import { Button } from "./ui/button/button";
import { Reveal } from "./ui/reveal";
import { TextReveal } from "./ui/text-reveal";

export default function Announcement() {
  return (
    <Alert className="mb-10 h-17 pl-2">
      <AlertTitle>
        <Reveal variant="slideDown" className="flex gap-1">
          <div className="size-5">
            <Image
              src="/icon-openpolicy.svg"
              className="size-5 dark:invert-100"
              alt="Logo"
              width={200}
              height={200}
            />
          </div>
          OpenPolicy
        </Reveal>
      </AlertTitle>
      <AlertDescription>
        <TextReveal variant="slideUp" staggerDelay={0.02}>
          Go check out my latest project
        </TextReveal>
      </AlertDescription>
      <AlertAction>
        <Reveal variant="slideLeft" delay={0.5}>
          <Link href={"https://openpolicyhq.com"} target="_blank">
            <Button size="sm" variant="secondary">
              Visit website
            </Button>
          </Link>
        </Reveal>
      </AlertAction>
    </Alert>
  );
}
