"use client";

import { Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { cn } from "@/lib/utils";

const REVEAL = 64;
const DRAG_THRESHOLD = 4;

/**
 * A row that reveals a confirm-delete action on left-swipe and, optionally,
 * fires onClick for a plain tap. Renders a <button> when clickable (project /
 * client rows) and a <div> otherwise (rows that hold their own controls, like
 * a task checkbox), so we never nest interactive elements.
 */
export function SwipeRow({
  children,
  onDelete,
  deleteTitle,
  deleteDescription,
  deleteLabel,
  onClick,
  className,
  outerClassName,
}: {
  children: ReactNode;
  onDelete: () => void;
  deleteTitle: string;
  deleteDescription: ReactNode;
  deleteLabel: string;
  onClick?: () => void;
  className?: string;
  outerClassName?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    const interactive = (e.target as HTMLElement).closest("button, a");
    if (interactive && interactive !== e.currentTarget) {
      return;
    }
    startX.current = e.clientX;
    startOffset.current = offset;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) {
      return;
    }
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      moved.current = true;
    }
    setOffset(Math.max(-REVEAL, Math.min(0, startOffset.current + delta)));
  }
  function onPointerUp() {
    if (!dragging) {
      return;
    }
    setDragging(false);
    setOffset((current) => (current < -REVEAL / 2 ? -REVEAL : 0));
  }
  function handleClick() {
    if (!moved.current) {
      onClick?.();
    }
  }

  const sharedProps = {
    className: cn(
      "flex w-full touch-pan-y items-center gap-3 bg-background py-3 text-left",
      offset < 0 && "pr-4",
      onClick ? "cursor-pointer" : "cursor-default",
      className
    ),
    onPointerCancel: onPointerUp,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    style: {
      transform: `translateX(${offset}px)`,
      transition: dragging ? "none" : "transform 0.2s ease",
    },
  };

  return (
    <div className={cn("relative overflow-hidden", outerClassName)}>
      <ConfirmDelete
        description={deleteDescription}
        onConfirm={onDelete}
        title={deleteTitle}
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={deleteLabel}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      {onClick ? (
        <button {...sharedProps} onClick={handleClick} type="button">
          {children}
        </button>
      ) : (
        <div {...sharedProps}>{children}</div>
      )}
    </div>
  );
}
