"use client";

import { Dialog } from "@base-ui-components/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A right-anchored, animated drawer built on Base UI's Dialog primitive.
 * Mirrors the shadcn Drawer API (Drawer, DrawerTrigger, DrawerContent,
 * DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose)
 * and slides in from the right with an ease-out spring curve.
 */

function Drawer(props: ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root {...props} />;
}

function DrawerTrigger(props: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose(props: ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Dialog.Popup>) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
        data-slot="drawer-overlay"
      />
      <Dialog.Popup
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-border/70 border-l bg-background shadow-2xl outline-none",
          "sm:max-w-md",
          "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
          className
        )}
        data-slot="drawer-content"
        {...props}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-border/60 border-b px-5 py-4",
        className
      )}
      data-slot="drawer-header"
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2 border-border/60 border-t px-5 py-4",
        className
      )}
      data-slot="drawer-footer"
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn("font-semibold text-foreground text-lg", className)}
      data-slot="drawer-title"
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
