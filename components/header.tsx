"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button/button";
import { GitHub } from "./ui/github-icon";
import { Separator } from "./ui/separator/separator";
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip/tooltip";
import { usePathname } from "next/navigation";

export default function Header() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const navItems = [
    { name: "About", url: "/about" },
    { name: "Blog", url: "/blog" },
    { name: "Tools", url: "/tools" },
  ];

  function ThemeIcon() {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) {
      return <span className="size-4.5 shrink-0" aria-hidden />;
    }
    return theme === "dark" ? (
      <Sun className="size-4.5 shrink-0" />
    ) : (
      <Moon className="size-4.5 shrink-0" />
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between h-14 w-full pt-2">
        {/*Section 1*/}
        <div className="h-full flex items-center justify-center">
          <Link href={"/"}>
            <div className="cursor-pointer group p-2 pt-1 flex justify-center items-center bg-primary relative text-primary-foreground font-medium">
              <div className="italic">zakary</div>
              <div className="absolute font-mono text-xs bg-accent -bottom-3 text-primary px-0.5 border border-border">
                fofana
              </div>
            </div>
          </Link>
          <div className="flex gap-2 items-center ml-6 mr-4">
            {navItems.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.url}
                  className={cn(
                    "text-sm hover:bg-accent p-2 px-4 text-muted-foreground hover:text-primary",
                    pathname === item.url ? "bg-accent text-primary" : "",
                  )}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/*Section 2*/}
        <div className="flex gap-4 items-center h-fit">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant={"outline"} size={"md"}>
                  Contact me
                </Button>
              }
            />
            <TooltipPortal>
              <TooltipPositioner className="mt-2">
                <TooltipPopup>
                  <TooltipArrow />
                  Don't be shy, reach out
                </TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>

          <Separator orientation="vertical" className={"h-6!"} />

          <Link target="_blank" href="https://github.com/zakafz">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className={"aspect-square"}
                    variant="ghost"
                    size={"md"}
                  >
                    <GitHub className="size-4.5 shrink-0" />
                  </Button>
                }
              />
              <TooltipPortal>
                <TooltipPositioner className="mt-2">
                  <TooltipPopup className="shadow-none text-xs font-mono">
                    <TooltipArrow />
                    Check out my GitHub profile
                  </TooltipPopup>
                </TooltipPositioner>
              </TooltipPortal>
            </Tooltip>
          </Link>

          <Separator orientation="vertical" className={"h-5!"} />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className={cn("aspect-square")}
                  variant="ghost"
                  size={"md"}
                  onClick={toggleTheme}
                >
                  <ThemeIcon />
                </Button>
              }
            />
            <TooltipPortal>
              <TooltipPositioner className="mt-2">
                <TooltipPopup className="shadow-none text-xs font-mono">
                  <TooltipArrow />
                  Change theme
                </TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
