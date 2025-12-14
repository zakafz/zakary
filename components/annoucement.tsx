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
    <Alert className="mb-10 h-18 pl-2">
      <AlertTitle>
        <Reveal className="flex gap-1" variant="slideDown">
          <div className="size-5">
            <Image
              alt="Logo"
              className="size-5 dark:invert-100"
              height={200}
              src="/icon-openpolicy.svg"
              width={200}
            />
          </div>
          OpenPolicy
        </Reveal>
      </AlertTitle>
      <AlertDescription>
        <TextReveal staggerDelay={0.02} variant="slideUp">
          Go check out my latest project
        </TextReveal>
      </AlertDescription>
      <AlertAction>
        <Reveal delay={0.5} variant="slideLeft">
          <Link href={"https://openpolicyhq.com"} target="_blank">
            <Button size="sm" variant="secondary">
              Visit <span className="ml-1 max-md:hidden">website</span>
            </Button>
          </Link>
        </Reveal>
      </AlertAction>
    </Alert>
  );
}
