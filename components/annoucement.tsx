import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert/alert";
import { Button } from "./ui/button/button";

export default function Announcement() {
  return (
    <Alert className="mb-10 h-17 pl-2">
      <AlertTitle className="flex gap-1">
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
      </AlertTitle>
      <AlertDescription>Go check out my latest project</AlertDescription>
      <AlertAction>
        <Link href={"https://openpolicyhq.com"} target="_blank">
          <Button size="sm" variant="secondary">
            Visit website
          </Button>
        </Link>
      </AlertAction>
    </Alert>
  );
}
