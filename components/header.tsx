"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
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
            <div className="cursor-pointer group font-serif p-2 pt-1 flex justify-center items-center bg-primary relative text-primary-foreground font-medium">
              <div className="italic text-lg">zakary</div>
              <div className="absolute text-sm bg-accent -bottom-3 text-primary px-0.5 border border-border">
                fofana
              </div>
            </div>
          </Link>
          <div className="flex gap-2 items-center ml-6 mr-4 max-md:hidden">
            {navItems.map((item) => (
              <div key={item.url}>
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
                <Link href="/contact" className="max-md:hidden">
                  <Button variant={"outline"} size={"md"}>
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

          <Separator orientation="vertical" className={"h-6! max-md:hidden"} />

          <Link
            target="_blank"
            href="https://github.com/zakafz"
            className="max-md:hidden"
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className={"aspect-square"}
                    variant="ghost"
                    size={"md"}
                  >
                    <GitHub className="size-4.5 shrink-0 max-md:hidden" />
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

          <Separator orientation="vertical" className={"h-5! max-md:hidden"} />

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

          <Separator orientation="vertical" className={"h-5! md:hidden"} />

          <Tooltip>
            <Sheet>
              <SheetTrigger asChild>
                <TooltipTrigger
                  render={
                    <Button
                      className={cn("aspect-square md:hidden")}
                      variant="outline"
                      size={"md"}
                    >
                      <Menu className="size-4.5 shrink-0" />
                    </Button>
                  }
                />
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 p-4 h-full">
                  <SheetTitle className="font-medium text-sm">Menu</SheetTitle>
                  {navItems.map((item, index) => (
                    <Link key={index} href={item.url}>
                      <Button
                        variant="outline"
                        className={cn(
                          "text-sm w-full font-mono",
                          pathname === item.url
                            ? "bg-primary text-primary-foreground pointer-events-none border-primary"
                            : "",
                        )}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className={cn(
                        "text-sm w-full font-mono pointer-events-none",
                        pathname === "/contact"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "",
                      )}
                    >
                      Contact me
                    </Button>
                  </Link>
                  <SheetClose asChild>
                    <Button className="md:hidden mt-auto" variant="primary">
                      Close
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            <TooltipPortal>
              <TooltipPositioner className="mt-2">
                <TooltipPopup className="shadow-none text-xs font-mono">
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
