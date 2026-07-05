"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Wraps a delete trigger in a confirmation dialog. Used by every dashboard
 * panel with swipe-to-delete so a destructive tap always asks first.
 */
export function ConfirmDelete({
  title = "Delete?",
  description,
  confirmLabel = "Delete",
  triggerLabel,
  triggerClassName,
  triggerStyle,
  onConfirm,
  children,
}: {
  title?: string;
  description: ReactNode;
  confirmLabel?: string;
  triggerLabel: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={triggerLabel}
        className={triggerClassName}
        style={triggerStyle}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
