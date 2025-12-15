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
import { type TableRowData, tools } from "@/data/tool-data";
import { cn } from "@/lib/utils";

const GRID_COLS = "grid [grid-template-columns:40px_100px_1fr_140px_2fr]";

type AccordionRowProps = {
  row: TableRowData;
  isOpen: boolean;
  onToggle: () => void;
};

function AccordionRow({ row, isOpen, onToggle }: AccordionRowProps) {
  const hasChildren = !!row.children && row.children.length > 0;

  let icon: React.ReactNode;
  if (hasChildren) {
    if (isOpen) {
      icon = (
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      );
    } else {
      icon = (
        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
      );
    }
  } else {
    icon = <div className="h-4 w-4" />;
  }

  return (
    <>
      <TableRow
        className={cn(GRID_COLS, "bg-background", isOpen ? "border-b-0" : "")}
      >
        <TableCell className="p-0">
          <Button
            aria-label={isOpen ? "Collapse row" : "Expand row"}
            className={cn(
              "h-full w-full rounded-none p-3 text-muted-foreground ring-0! transition-colors",
              hasChildren ? "hover:bg-transparent hover:text-foreground" : "",
              hasChildren ? "" : "cursor-default opacity-30"
            )}
            disabled={!hasChildren}
            onClick={onToggle}
            size="icon"
            variant="ghost"
          >
            {icon}
          </Button>
        </TableCell>

        <TableCell className="p-3 font-medium font-mono text-muted-foreground text-sm">
          {row.id}
        </TableCell>

        <TableCell className="p-3 font-medium text-sm">
          {row.url ? (
            <a
              className="hover:underline"
              href={row.url}
              rel="noopener noreferrer"
              target="_blank"
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

        <TableCell className="truncate p-3 text-muted-foreground text-sm">
          {row.description ?? ""}
        </TableCell>
      </TableRow>

      {hasChildren ? (
        <TableRow className={cn(GRID_COLS, "border-b-0 hover:bg-transparent")}>
          <TableCell className="col-span-6 p-0" colSpan={6}>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="w-full border-border/70 border-b">
                <Table>
                  <TableHeader className="border-border/70 border-b-0 dark:bg-(--mix-card-33-bg)/70">
                    <TableRow className={GRID_COLS}>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5" />
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5 text-primary text-xs">
                        ID
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5 text-primary text-xs">
                        Name
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5 text-primary text-xs">
                        Category
                      </TableHead>
                      <TableHead className="flex h-7 items-center border-border/70 border-y px-3 py-1.5 text-primary text-xs">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {row.children?.map((childRow) => (
                      <TableRow
                        className={cn(
                          GRID_COLS,
                          "dark:bg-(--mix-card-33-bg)/70"
                        )}
                        key={childRow.id}
                      >
                        <TableCell className="px-3 py-2" />
                        <TableCell className="px-3 py-2 font-mono text-muted-foreground text-xs">
                          {childRow.id}
                        </TableCell>
                        <TableCell className="px-3 py-2 font-medium text-xs">
                          {childRow.url ? (
                            <a
                              className="hover:underline"
                              href={childRow.url}
                              rel="noopener noreferrer"
                              target="_blank"
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
                        <TableCell className="truncate px-3 py-2 text-muted-foreground text-xs">
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
      ) : null}
    </>
  );
}

export default function ToolsTable() {
  const [openId, setOpenId] = useState<string | null>(tools[0]?.id ?? null);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/70 border-b-0">
      <div className="overflow-x-auto">
        <Table className="min-w-4xl">
          <TableHeader className="border-border/70 dark:bg-(--mix-card-33-bg)/70">
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
                isOpen={openId === row.id}
                key={row.id}
                onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                row={row}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
