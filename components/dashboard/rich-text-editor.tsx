"use client";

import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  type LucideIcon,
  TypeIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Command = {
  icon: LucideIcon;
  label: string;
  run: () => void;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Seed the editable once on mount. After that the DOM is the source of
  // truth — writing innerHTML on every render would fight the caret.
  // biome-ignore lint/correctness/useExhaustiveDependencies: seed once on mount; the DOM owns content afterward
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, []);

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    // execCommand is deprecated but is still the simplest cross-browser way to
    // do basic formatting inside a contenteditable, and works on mobile Safari.
    document.execCommand(cmd, false, arg);
    emit();
  }

  function toggleHeading() {
    const block = document.queryCommandValue("formatBlock").toLowerCase();
    exec("formatBlock", block === "h2" ? "p" : "h2");
  }

  const commands: Command[] = [
    { icon: TypeIcon, label: "Heading", run: toggleHeading },
    { icon: BoldIcon, label: "Bold", run: () => exec("bold") },
    { icon: ItalicIcon, label: "Italic", run: () => exec("italic") },
    {
      icon: ListIcon,
      label: "Bulleted list",
      run: () => exec("insertUnorderedList"),
    },
    {
      icon: ListOrderedIcon,
      label: "Numbered list",
      run: () => exec("insertOrderedList"),
    },
  ];

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      {/* biome-ignore lint/a11y/useSemanticElements: a contenteditable rich-text surface has no plain-element equivalent */}
      <div
        aria-label={placeholder ?? "Note body"}
        aria-multiline="true"
        className={cn(
          "min-h-40 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden py-3 text-[16px] leading-relaxed outline-none",
          "whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
          "[&:empty::before]:text-muted-foreground [&:empty::before]:content-[attr(data-placeholder)]",
          "[&_h2]:mt-3 [&_h2]:font-semibold [&_h2]:text-xl",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_a]:underline"
        )}
        contentEditable
        data-placeholder={placeholder}
        onInput={emit}
        ref={ref}
        role="textbox"
        suppressContentEditableWarning
        tabIndex={0}
      />

      <div className="sticky bottom-0 flex items-center gap-1 border-border border-t bg-background py-2">
        {commands.map((c) => (
          <button
            aria-label={c.label}
            className="inline-flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            key={c.label}
            // Keep the selection: mousedown default would blur the editor.
            onMouseDown={(e) => {
              e.preventDefault();
              c.run();
            }}
            type="button"
          >
            <c.icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
