"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button/button";
import { GitHub } from "./ui/github-icon";
import { Separator } from "./ui/separator/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip/tooltip";

export default function Header() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const navItems = [
    { name: "About", url: "/about" },
    { name: "Blog", url: "/blog" },
    { name: "Tools", url: "/tools" },
  ];

  function ThemeIcon() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) {
      return <span aria-hidden className="size-4.5 shrink-0" />;
    }
    return theme === "dark" ? (
      <Sun className="size-4.5 shrink-0" />
    ) : (
      <Moon className="size-4.5 shrink-0" />
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-14 w-full items-center justify-between pt-2">
        {/*Section 1*/}
        <div className="flex h-full items-center justify-center">
          <Link href={"/"}>
            <div className="group relative flex cursor-pointer items-center justify-center bg-primary p-2 pt-1 font-medium font-serif text-primary-foreground">
              <div className="text-lg italic">zakary</div>
              <div className="-bottom-3 absolute border border-border bg-accent px-0.5 text-primary text-sm">
                fofana
              </div>
            </div>
          </Link>
          <div className="mr-4 ml-6 flex items-center gap-2 max-md:hidden">
            {navItems.map((item) => (
              <div key={item.url}>
                <Link
                  className={cn(
                    "p-2 px-4 text-muted-foreground text-sm hover:bg-accent hover:text-primary",
                    pathname === item.url ? "bg-accent text-primary" : ""
                  )}
                  href={item.url}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/*Section 2*/}
        <div className="flex h-fit items-center gap-4">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link className="max-md:hidden" href="/contact">
                  <Button size={"md"} variant={"outline"}>
                    Contact me
                  </Button>
                </Link>
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

          <Separator className={"h-6! max-md:hidden"} orientation="vertical" />

          <Link
            className="max-md:hidden"
            href="https://github.com/zakafz"
            target="_blank"
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className={"aspect-square"}
                    size={"md"}
                    variant="ghost"
                  >
                    <GitHub className="size-4.5 shrink-0 max-md:hidden" />
                  </Button>
                }
              />
              <TooltipPortal>
                <TooltipPositioner className="mt-2">
                  <TooltipPopup className="font-mono text-xs shadow-none">
                    <TooltipArrow />
                    Check out my GitHub profile
                  </TooltipPopup>
                </TooltipPositioner>
              </TooltipPortal>
            </Tooltip>
          </Link>

          <Separator className={"h-5! max-md:hidden"} orientation="vertical" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className={cn("aspect-square")}
                  onClick={toggleTheme}
                  size={"md"}
                  variant="ghost"
                >
                  <ThemeIcon />
                </Button>
              }
            />
            <TooltipPortal>
              <TooltipPositioner className="mt-2">
                <TooltipPopup className="font-mono text-xs shadow-none">
                  <TooltipArrow />
                  Change theme
                </TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>

          <Separator className={"h-5! md:hidden"} orientation="vertical" />

          <Tooltip>
            <Sheet>
              <SheetTrigger asChild>
                <TooltipTrigger
                  render={
                    <Button
                      className={cn("aspect-square md:hidden")}
                      size={"md"}
                      variant="outline"
                    >
                      <Menu className="size-4.5 shrink-0" />
                    </Button>
                  }
                />
              </SheetTrigger>
              <SheetContent>
                <div className="flex h-full flex-col gap-4 p-4">
                  <SheetTitle className="font-medium text-sm">Menu</SheetTitle>
                  {navItems.map((item, index) => (
                    <Link href={item.url} key={index}>
                      <Button
                        className={cn(
                          "w-full font-mono text-sm",
                          pathname === item.url
                            ? "pointer-events-none border-primary bg-primary text-primary-foreground"
                            : ""
                        )}
                        variant="outline"
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                  <Link href="/contact">
                    <Button
                      className={cn(
                        "pointer-events-none w-full font-mono text-sm",
                        pathname === "/contact"
                          ? "border-primary bg-primary text-primary-foreground"
                          : ""
                      )}
                      variant="outline"
                    >
                      Contact me
                    </Button>
                  </Link>
                  <SheetClose asChild>
                    <Button className="mt-auto md:hidden" variant="primary">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            <TooltipPortal>
              <TooltipPositioner className="mt-2">
                <TooltipPopup className="font-mono text-xs shadow-none">
                  <TooltipArrow />
                  Open menu
                </TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
