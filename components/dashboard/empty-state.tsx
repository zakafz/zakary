import type { LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <Empty className="rounded-none border-none py-12">
      <EmptyHeader>
        <EmptyMedia
          className="rounded-none bg-secondary text-muted-foreground"
          variant="icon"
        >
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="text-base">{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
    </Empty>
  );
}
