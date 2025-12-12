"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { cn } from "@/lib/utils";

const GRID_COLS = "grid [grid-template-columns:40px_100px_1fr_140px_2fr]";

interface TableRowData {
  id: string;
  name: string;
  url?: string;
  category: string;
  description?: string;
  section?: string;
  children?: TableRowData[];
}

const tools: TableRowData[] = [
  {
    id: "FEND",
    name: "Frontend",
    category: "Tools",
    description: "Languages and frameworks used to build user interfaces",
    children: [
      {
        id: "FEND-1",
        name: "TypeScript",
        url: "https://www.typescriptlang.org",
        category: "Language",
        description: "Typed superset of JavaScript",
      },
      {
        id: "FEND-2",
        name: "Next.js",
        url: "https://nextjs.org",
        category: "Framework",
        description: "React framework for server-rendered and static apps",
      },
      {
        id: "FEND-3",
        name: "Tailwind CSS",
        url: "https://tailwindcss.com",
        category: "CSS",
        description: "Utility-first CSS framework",
      },
    ],
  },
  {
    id: "CLIB",
    name: "Component Libraries",
    category: "Tools",
    description: "UI kits and component systems I use",
    children: [
      {
        id: "CLIB-1",
        name: "shadcn/ui",
        url: "https://ui.shadcn.com",
        category: "Library",
        description: "Composable components built with Radix + Tailwind",
      },
      {
        id: "CLIB-2",
        name: "Coss UI",
        url: "https://coss.com",
        category: "Library",
        description: "Lightweight component set",
      },
      {
        id: "CLIB-3",
        name: "Base UI",
        url: "https://baseweb.design",
        category: "Library",
        description: "Design-system-driven React components",
      },
    ],
  },
  {
    id: "MSET",
    name: "My Setup",
    category: "Hardware",
    description: "Primary hardware I use for development",
    children: [
      {
        id: "MSET-1",
        name: "MacBook Pro (M5)",
        url: "https://www.apple.com/macbook-pro/",
        category: "Laptop",
        description: "Apple M5 laptop (primary development machine)",
      },
      {
        id: "MSET-2",
        name: "Magic Keyboard",
        url: "https://www.apple.com/search/Magic%20Keyboard",
        category: "Peripherals",
        description: "Best keyboard OAT",
      },
      {
        id: "MSET-3",
        name: "Magic Trackpad",
        url: "https://www.apple.com/search/Magic%20Trackpad",
        category: "Peripherals",
        description: "Large multitouch trackpad",
      },
    ],
  },
  {
    id: "BCKN",
    name: "Backend",
    category: "Tools",
    description: "Server-side languages and tooling",
    children: [
      {
        id: "BCKN-1",
        name: "Golang",
        url: "https://go.dev",
        category: "Language",
        description: "Compiled language focused on simplicity and concurrency",
      },
    ],
  },
  {
    id: "AITL",
    name: "AI Tools",
    category: "Tools",
    description: "Models and utilities used for AI workflows",
    children: [
      {
        id: "AITL-1",
        name: "Gemini 3",
        category: "Model",
        description: "Large multimodal model",
      },
      {
        id: "AITL-2",
        name: "Other AI",
        category: "Tooling",
        description: "Various AI utilities",
      },
    ],
  },
];

interface AccordionRowProps {
  row: TableRowData;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionRow({ row, isOpen, onToggle }: AccordionRowProps) {
  const hasChildren = !!row.children && row.children.length > 0;

  return (
    <>
      <TableRow
        className={cn(GRID_COLS, "bg-background", isOpen && "border-b-0")}
      >
        <TableCell className="p-0">
          <Button
            aria-label={isOpen ? "Collapse row" : "Expand row"}
            className={cn(
              "h-full w-full ring-0! rounded-none p-3 text-muted-foreground transition-colors",
              hasChildren && "hover:bg-transparent hover:text-foreground",
              !hasChildren && "cursor-default opacity-30",
            )}
            disabled={!hasChildren}
            onClick={onToggle}
            size="icon"
            variant="ghost"
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>
        </TableCell>

        <TableCell className="p-3 font-medium font-mono text-muted-foreground text-sm">
          {row.id}
        </TableCell>

        <TableCell className="p-3 font-medium text-sm">
          {row.url ? (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {row.name}
            </a>
          ) : (
            row.name
          )}
        </TableCell>

        <TableCell className="p-3 text-muted-foreground text-sm">
          {row.category}
        </TableCell>

        <TableCell className="p-3 text-muted-foreground text-sm truncate">
          {row.description ?? ""}
        </TableCell>
      </TableRow>

      {hasChildren && (
        <TableRow className={cn(GRID_COLS, "border-b-0 hover:bg-transparent")}>
          <TableCell className="col-span-6 p-0" colSpan={6}>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-500 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="w-full border-border/70 border-b">
                <Table>
                  <TableHeader className="border-b-0 border-border/70">
                    <TableRow className={GRID_COLS}>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5" />
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 text-primary py-1.5 text-xs">
                        ID
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 text-primary py-1.5 text-xs">
                        Name
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 text-primary py-1.5 text-xs">
                        Category
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 text-primary py-1.5 text-xs">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {row.children?.map((childRow) => (
                      <TableRow className={GRID_COLS} key={childRow.id}>
                        <TableCell className="px-3 py-2" />
                        <TableCell className="px-3 py-2 font-mono text-muted-foreground text-xs">
                          {childRow.id}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-medium text-xs">
                          {childRow.url ? (
                            <a
                              href={childRow.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {childRow.name}
                            </a>
                          ) : (
                            childRow.name
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-muted-foreground text-xs">
                          {childRow.category}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-muted-foreground text-xs truncate">
                          {childRow.description ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function ToolsTable() {
  const [openId, setOpenId] = useState<string | null>(tools[0]?.id ?? null);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/70 border-b-0">
      <div className="overflow-x-auto">
        <Table className="min-w-4xl">
          <TableHeader className="border-border/70 dark:bg-background">
            <TableRow className={GRID_COLS}>
              <TableHead className="p-3" />
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                ID
              </TableHead>
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                Name
              </TableHead>
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                Category
              </TableHead>
              <TableHead className="p-3 font-semibold text-foreground text-sm">
                Description
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tools.map((row) => (
              <AccordionRow
                key={row.id}
                row={row}
                isOpen={openId === row.id}
                onToggle={() => setOpenId(openId === row.id ? null : row.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
