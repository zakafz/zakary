import type * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-[95%] max-w-5xl mx-auto flex flex-col", className)}>
      {children}
    </div>
  );
}
