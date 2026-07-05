"use client";
import { work } from "@/data/work";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, RefreshCcw } from "lucide-react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button/button";
import {
  Select,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "./ui/select/select";
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip/tooltip";

type HistoryItem = {
  id: string;
  content: ReactNode;
  isCommand: boolean;
};

type Theme = {
  value: string;
  label: string;
  colors: {
    background: string;
    text: string;
    prefix: string;
    directory: string;
    hover: string;
  };
};

const THEMES: Theme[] = [
  {
    value: "default",
    label: "Default",
    colors: {
      background: "bg-white dark:bg-(--mix-card-33-bg)",
      text: "text-zinc-800 dark:text-primary",
      prefix: "text-blue-600 dark:text-blue-300",
      directory: "text-zinc-500 dark:text-foreground",
      hover: "hover:bg-zinc-950/10 dark:hover:bg-primary/10!",
    },
  },
  {
    value: "oh-my-zsh",
    label: "Oh My Zsh",
    colors: {
      background: "bg-zinc-50 dark:bg-[#101010]",
      text: "text-green-700 dark:text-green-400",
      prefix: "text-cyan-700 dark:text-cyan-400 font-bold",
      directory: "text-blue-700 dark:text-blue-400 font-bold",
      hover: "hover:bg-green-700/10 dark:hover:bg-green-400/10!",
    },
  },
  {
    value: "ubuntu",
    label: "Ubuntu",
    colors: {
      background: "bg-zinc-50 dark:bg-[#300a24]",
      text: "text-[#300a24] dark:text-white",
      prefix: "text-[#4e9a06] dark:text-[#87ff5f]",
      directory: "text-[#3465a4] dark:text-[#729fcf]",
      hover: "hover:bg-[#300a24]/10 dark:hover:bg-white/10!",
    },
  },
  {
    value: "dracula",
    label: "Dracula",
    colors: {
      background: "bg-zinc-50 dark:bg-[#282a36]",
      text: "text-[#282a36] dark:text-[#f8f8f2]",
      prefix: "text-[#ff79c6] dark:text-[#ff79c6]",
      directory: "text-[#bd93f9] dark:text-[#bd93f9]",
      hover: "hover:bg-[#282a36]/10 dark:hover:bg-[#f8f8f2]/10!",
    },
  },
];

type CommandDefinition = {
  description: string;
  args?: string;
  subCommands?: {
    name: string;
    description: string;
  }[];
  fn: (args: string[]) => ReactNode;
};

type Commands = {
  [key: string]: CommandDefinition;
};

const LEADING_SPACES_REGEX = /^\s*/;

const HelpOutput = ({ commands }: { commands: Commands }) => (
  <div className="flex flex-col gap-1 py-1">
    <div className="mb-2 text-muted-foreground text-xs">
      Usage: type <span className="font-bold text-foreground">command</span>{" "}
      [args]
    </div>
    <div className="grid grid-cols-[120px_1fr] gap-x-4">
      <div className="border-border/70 border-b pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Command
      </div>
      <div className="border-border/70 border-b pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Description
      </div>
      {Object.entries(commands).map(([key, def]) => (
        <div className="contents" key={key}>
          <div className="flex items-center gap-2 py-1">
            <span className="font-semibold text-primary">{key}</span>
          </div>
          <div className="py-1 text-muted-foreground">{def.description}</div>
          {def.subCommands?.map((sub) => (
            <div className="contents" key={`${key}-${sub.name}`}>
              <div className="flex items-center gap-2 py-1 pl-4">
                <span className="bg-white font-semibold text-primary-foreground">
                  {sub.name}
                </span>
              </div>
              <div className="py-1 text-muted-foreground text-xs">
                {sub.description}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default function FakeTerminal() {
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isMaximized, setIsMaximized] = useState<boolean>(false);


  const [input, setInput] = useState<string>("");
  const initialHelpOutput: HistoryItem = {
    id: "init-help",
    content: (
      <span className="text-muted-foreground">
        Type <span className="font-bold text-foreground">help</span> to see
        available commands.
      </span>
    ),
    isCommand: false,
  };

  const [history, setHistory] = useState<HistoryItem[]>([initialHelpOutput]);

  const endOfHistoryRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [caretPos, setCaretPos] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [caretVisible, setCaretVisible] = useState<boolean>(true);
  const [showCandidates, setShowCandidates] = useState<boolean>(false);

  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [savedInputBeforeHistory, setSavedInputBeforeHistory] =
    useState<string>("");

  const [tabMatches, setTabMatches] = useState<string[] | null>(null);
  const [tabIndex, setTabIndex] = useState<number>(-1);

  const [suggestion, setSuggestion] = useState<string>("");

  const commands: Commands = {
    help: {
      description: "Show all available commands.",
      fn: () => <HelpOutput commands={commands} />,
    },
    about: {
      description: "Learn more about me.",
      fn: () => "My name is Zakary. I am a software engineer and designer.",
    },
    socials: {
      description: "Find me on social media.",
      fn: () => (
        <div className="flex flex-col gap-1">
          <div>
            GitHub:{" "}
            <a
              className="text-blue-500 underline decoration-blue-500/30 hover:decoration-blue-500"
              href="https://github.com/zakafz"
              rel="noopener noreferrer"
              target="_blank"
            >
              @zakafz
            </a>
          </div>
          <div>
            LinkedIn:{" "}
            <a
              className="text-blue-500 underline decoration-blue-500/30 hover:decoration-blue-500"
              href="https://linkedin.com/in/zakary-fofana"
              rel="noopener noreferrer"
              target="_blank"
            >
              Zakary Fofana
            </a>
          </div>
        </div>
      ),
    },
    work: {
      description: "List projects or show details.",
      args: "[ls] | -p <id>",
      subCommands: [
        { name: "ls", description: "List all available projects." },
        { name: "-p <id>", description: "View detailed project information." },
      ],
      fn: (args) => {
        const subcommand = args[0];

        if (!subcommand || subcommand === "ls") {
          return (
            <div className="flex flex-col gap-1 py-1">
              <div className="grid grid-cols-[120px_1fr] gap-x-4">
                <div className="border-border/70 border-b pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  ID
                </div>
                <div className="border-border/70 border-b pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Description
                </div>
                {work
                  .filter((item) => item.id !== "maybe-you")
                  .map((project) => (
                    <div className="contents" key={project.id}>
                      <div className="py-1 font-semibold text-primary">
                        {project.id}
                      </div>
                      <div className="py-1 text-muted-foreground">
                        {project.description}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        }

        if (subcommand === "-p") {
          const projectId = args[1];
          if (!projectId) {
            return (
              <span className="text-red-500">
                Error: Missing project ID. Usage: work -p &lt;id&gt;
              </span>
            );
          }

          const project = work.find((p) => p.id === projectId);
          if (!project) {
            return (
              <span className="text-red-500">
                Error: Project not found with ID "{projectId}".
              </span>
            );
          }

          return (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2 border-border/70 border-b pb-4">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-xl">{project.title}</h1>
                  {!!project.website && (
                    <a
                      className="text-blue-500 text-xs underline decoration-blue-500/30 hover:decoration-blue-500"
                      href={project.website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Website
                    </a>
                  )}
                </div>
                <p className="text-muted-foreground">{project.description}</p>
              </div>

              {!!project.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  {project.content}
                </div>
              )}
            </div>
          );
        }

        return (
          <span className="text-red-500">
            Error: Unknown subcommand "{subcommand}". Usage: work [ls] | work -p
            &lt;id&gt;
          </span>
        );
      },
    },
    clear: {
      description: "Clear the terminal.",
      fn: () => {
        setHistory([]);
        return null;
      },
    },
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on history change
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "auto" });
  }, [history]);

  useEffect(() => {
    if (!isFocused) {
      setCaretVisible(false);
      return;
    }
    setCaretVisible(true);
    const id = setInterval(() => setCaretVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, [isFocused]);

  const updateCaretFromInput = (el?: HTMLInputElement | null) => {
    const inputEl = el ?? inputRef.current;
    if (!inputEl) {
      return;
    }
    const pos = inputEl.selectionStart ?? inputEl.value.length;
    setCaretPos(pos);
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setInput("");
    setCaretPos(0);
    setHistoryIndex(-1);
    setTabMatches(null);

    setSuggestion("");
  };

  const focusInput = () =>
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    const pos = e.target.selectionStart ?? value.length;
    setCaretPos(pos);

    setTabMatches(null);
    setTabIndex(-1);
    setSuggestion("");

    if (historyIndex !== -1) {
      setHistoryIndex(-1);
    }

    endOfHistoryRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const findMatches = (partial: string) => {
    const keys = Object.keys(commands);
    const low = partial.toLowerCase();
    return keys.filter((k) => k.startsWith(low));
  };

  const applyCompletion = (completion: string) => {
    const current = input;
    const leadingMatch = current.match(LEADING_SPACES_REGEX);
    const leading = leadingMatch ? leadingMatch[0] : "";
    const leadingLen = leading.length;
    const firstSpaceIndex = current.indexOf(" ", leadingLen);
    const remainder =
      firstSpaceIndex === -1 ? "" : current.slice(firstSpaceIndex);

    const newInput = `${leading}${completion}${remainder}`;
    setInput(newInput);

    setTimeout(() => {
      if (!inputRef.current) {
        return;
      }
      const pos = (leading + completion).length;
      inputRef.current.setSelectionRange(pos, pos);
      updateCaretFromInput();
    }, 0);
  };

  const computeSuggestion = () => {
    const leadingMatch = input.match(LEADING_SPACES_REGEX);
    const leading = leadingMatch ? leadingMatch[0].length : 0;
    const firstSpace = input.indexOf(" ", leading);
    const tokenStart = leading;
    const tokenEnd = firstSpace === -1 ? input.length : firstSpace;

    if (caretPos !== tokenEnd) {
      setSuggestion("");
      return;
    }

    const partial = input.slice(tokenStart, tokenEnd);
    if (!partial) {
      setSuggestion("");
      return;
    }

    const matches = findMatches(partial);
    if (matches.length === 0) {
      setSuggestion("");
      return;
    }

    const match = matches[0];
    const suffix = match.slice(partial.length);
    setSuggestion(suffix);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: computeSuggestion is unstable
  useEffect(() => {
    computeSuggestion();
  }, [input, caretPos]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: tab handling is complex
  const handleTabKey = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const leadingMatch = input.match(LEADING_SPACES_REGEX);
    const leadingLen = leadingMatch ? leadingMatch[0].length : 0;
    const firstSpace = input.indexOf(" ", leadingLen);
    const tokenEnd = firstSpace === -1 ? input.length : firstSpace;
    const partial = input.slice(leadingLen, tokenEnd);

    // biome-ignore lint/performance/useTopLevelRegex: only used here
    const argsMatch = input.match(/^work\s+-p\s+(.*)$/);
    if (argsMatch) {
      const currentArg = argsMatch[1];
      const projectMatches = work
        .filter((p) => p.id !== "maybe-you" && p.id.startsWith(currentArg))
        .map((p) => p.id);

      if (projectMatches.length === 0) {
        return;
      }

      if (showCandidates && tabMatches) {
        const nextIndex = (tabIndex + 1) % tabMatches.length;
        setTabIndex(nextIndex);
        const prefix = input.slice(0, input.lastIndexOf(currentArg));
        setInput(prefix + tabMatches[nextIndex]);
        return;
      }

      if (projectMatches.length === 1) {
        const match = projectMatches[0];
        const prefix = input.slice(0, input.lastIndexOf(currentArg));
        setInput(`${prefix}${match} `);
        setShowCandidates(false);
        setTabMatches(null);
        return;
      }

      setTabMatches(projectMatches);
      setShowCandidates(true);
      setTabIndex(-1);
      return;
    }

    if (caretPos > tokenEnd) {
      const newVal = `${input.slice(0, caretPos)} ${input.slice(caretPos)}`;
      setInput(newVal);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(caretPos + 1, caretPos + 1);
          updateCaretFromInput();
        }
      }, 0);
      return;
    }

    if (showCandidates && tabMatches) {
      const nextIndex = (tabIndex + 1) % tabMatches.length;
      setTabIndex(nextIndex);
      applyCompletion(tabMatches[nextIndex]);
      return;
    }

    const matches = findMatches(partial);
    if (matches.length === 0) {
      return;
    }

    if (matches.length === 1) {
      const match = matches[0];
      const isComplete = match === partial;
      const completionWithSpace = isComplete ? `${match} ` : match;
      applyCompletion(completionWithSpace);
      setShowCandidates(false);
      setTabMatches(null);
      return;
    }

    setTabMatches(matches);
    setShowCandidates(true);
    setTabIndex(-1);
  };

  const handleArrowRight = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestion) {
      e.preventDefault();
      setInput(input + suggestion);
      setSuggestion("");
      setShowCandidates(false);
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = (input + suggestion).length;
          inputRef.current.setSelectionRange(newPos, newPos);
          updateCaretFromInput();
        }
      }, 0);
      return;
    }
    handleNavigationKeys();
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: suppress
  const handleHistoryNavigation = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (inputHistory.length === 0) {
      return;
    }

    if (e.key === "ArrowUp") {
      if (historyIndex === -1) {
        setSavedInputBeforeHistory(input);
        setHistoryIndex(0);
        const val = inputHistory.at(-1) ?? "";
        setInput(val);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(val.length, val.length);
          updateCaretFromInput();
        }, 0);
        return;
      }

      const next = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(next);
      const val = inputHistory.at(-(1 + next)) ?? "";
      setInput(val);
      setTimeout(() => {
        inputRef.current?.setSelectionRange(val.length, val.length);
        updateCaretFromInput();
      }, 0);
      return;
    }

    if (e.key === "ArrowDown") {
      if (historyIndex === -1) {
        return;
      }
      const next = historyIndex - 1;
      if (next === -1) {
        setHistoryIndex(-1);
        setInput(savedInputBeforeHistory);
        setTimeout(() => {
          const len = savedInputBeforeHistory.length;
          inputRef.current?.setSelectionRange(len, len);
          updateCaretFromInput();
        }, 0);
        return;
      }
      setHistoryIndex(next);
      const val = inputHistory.at(-(1 + next)) ?? "";
      setInput(val);
      setTimeout(() => {
        inputRef.current?.setSelectionRange(val.length, val.length);
        updateCaretFromInput();
      }, 0);
      return;
    }
  };

  const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) {
      resetInput();
      return;
    }

    setInputHistory((prev) => [...prev, raw]);

    const lower = raw.toLowerCase();

    const parts = lower.split(" ");
    const commandName = parts[0];

    const commandLine: HistoryItem = {
      id: crypto.randomUUID(),
      content: raw,
      isCommand: true,
    };

    if (commandName === "clear") {
      setHistory([]);
      resetInput();
      focusInput();
      return;
    }

    const outputItem = (() => {
      const maybe = commands[commandName]?.fn;
      if (!maybe) {
        return null;
      }
      const args = parts.slice(1);
      const out = maybe(args);
      return out
        ? { id: crypto.randomUUID(), content: out, isCommand: false }
        : null;
    })();

    setHistory((prev) => {
      const items: HistoryItem[] = [commandLine];
      if (outputItem) {
        items.push(outputItem);
      } else {
        items.push({
          id: crypto.randomUUID(),
          content: `command not found: ${commandName}`,
          isCommand: false,
        });
      }
      return [...prev, ...items];
    });

    resetInput();
    focusInput();
  };

  const handleNavigationKeys = () => {
    setTimeout(() => updateCaretFromInput(), 0);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      handleTabKey(e);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      handleHistoryNavigation(e);
      return;
    }

    if (e.key === "Enter") {
      if (showCandidates) {
        setShowCandidates(false);
        e.preventDefault();
        return;
      }
      handleEnterKey(e);
      return;
    }

    if (e.key === "ArrowRight") {
      handleArrowRight(e);
      return;
    }

    if (
      e.key === "ArrowLeft" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.key === "Backspace" ||
      e.key === "Delete"
    ) {
      handleNavigationKeys();
    }
  };

  const handleWrapperClick = () => {
    if (window.getSelection()?.toString()) {
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleClear = () => {
    setHistory([initialHelpOutput]);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleWrapperKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    const code = e.code;

    if (key === "Enter") {
      inputRef.current?.focus({ preventScroll: true });
      e.preventDefault();
      return;
    }

    const isSpaceKey = key === " " || key === "Spacebar" || code === "Space";
    if (isSpaceKey) {
      e.preventDefault();
      const el = inputRef.current;
      el?.focus();

      if (!el) {
        return;
      }
      const pos = el.selectionStart ?? caretPos ?? el.value.length;
      const newVal = `${el.value.slice(0, pos)} ${el.value.slice(pos)}`;
      setInput(newVal);
      setTimeout(() => {
        el.setSelectionRange(pos + 1, pos + 1);
        updateCaretFromInput(el);
      }, 0);
    }
  };

  const beforeCursor = input.slice(0, caretPos);
  const afterCursor = input.slice(caretPos);

  const activeTheme = THEMES.find((t) => t.value === currentTheme) || THEMES[0];
  const COMMAND_PREFIX = "user@zakary.dev";

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col border-[0.5px] border-border font-mono",
          activeTheme.colors.background,
          activeTheme.colors.text,
          currentTheme === "default" && "bg-white dark:bg-(--mix-card-33-bg)",
          isMaximized
            ? "fixed inset-0 z-50 h-screen w-screen"
            : "h-[60vh] w-full md:mb-20"
        )}
      >
        <div className="flex items-center justify-between border-border border-b-[0.5px] p-2">
          <span className="text-sm">
            <span className={activeTheme.colors.prefix}>terminal:</span>
            {COMMAND_PREFIX}
          </span>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Select
                    items={THEMES}
                    onValueChange={(val) => setCurrentTheme(val as string)}
                    value={currentTheme}
                  >
                    <SelectTrigger
                      className="h-6 min-w-[140px] bg-transparent text-xs!"
                      render={
                        <Button
                          className={cn(
                            "flex min-w-[140px] transition-none!",
                            activeTheme.colors.hover
                          )}
                          size="sm"
                          variant="outline"
                        />
                      }
                    >
                      <SelectValue />
                      <SelectIcon />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectPositioner
                        alignItemWithTrigger={false}
                        sideOffset={4}
                      >
                        <SelectPopup>
                          <SelectList>
                            {THEMES.map((theme) => (
                              <SelectItem
                                className="p-1 font-mono text-xs"
                                key={theme.value}
                                value={theme.value}
                              >
                                <SelectItemText>{theme.label}</SelectItemText>
                                <SelectItemIndicator />
                              </SelectItem>
                            ))}
                          </SelectList>
                        </SelectPopup>
                      </SelectPositioner>
                    </SelectPortal>
                  </Select>
                }
              />
              <TooltipPortal>
                <TooltipPositioner side="top">
                  <TooltipPopup className="mb-3">
                    <TooltipArrow />
                    Theme selector
                  </TooltipPopup>
                </TooltipPositioner>
              </TooltipPortal>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="size-6!"
                    onClick={handleClear}
                    size={"sm"}
                    variant={"ghost"}
                  >
                    <RefreshCcw className="size-4 shrink-0" />
                  </Button>
                }
              />
              <TooltipPortal>
                <TooltipPositioner side="top">
                  <TooltipPopup className="mb-3">
                    <TooltipArrow />
                    Reload terminal
                  </TooltipPopup>
                </TooltipPositioner>
              </TooltipPortal>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="size-6!"
                    onClick={() => setIsMaximized((v) => !v)}
                    size={"sm"}
                    variant={"ghost"}
                  >
                    {isMaximized ? (
                      <Minimize2 className="size-4 shrink-0" />
                    ) : (
                      <Maximize2 className="size-4 shrink-0" />
                    )}
                  </Button>
                }
              />
              <TooltipPortal>
                <TooltipPositioner side="top">
                  <TooltipPopup className="mb-3">
                    <TooltipArrow />
                    {isMaximized ? "Minimize" : "Maximize"}
                  </TooltipPopup>
                </TooltipPositioner>
              </TooltipPortal>
            </Tooltip>
          </div>
        </div>

        {/* biome-ignore lint/a11y: Terminal renders rich content which textarea cannot support */}
        <div
          aria-label="Terminal"
          className="flex h-full w-full select-text flex-col overflow-y-auto p-2 text-left text-sm outline-none"
          onClick={handleWrapperClick}
          onKeyDown={handleWrapperKeyDown}
          role="textbox"
          tabIndex={0}
        >
          <div>
            {history.map((item) => {
              if (item.isCommand) {
                return (
                  <div className="mb-1" key={item.id}>
                    <span className={cn(activeTheme.colors.prefix)}>
                      {COMMAND_PREFIX}
                    </span>
                    <span className="ml-2">{item.content}</span>
                  </div>
                );
              }
              return (
                <div className="mb-1 text-muted-foreground" key={item.id}>
                  {item.content}
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-wrap break-all">
            <span className={cn("mr-2 shrink-0", activeTheme.colors.prefix)}>
              {COMMAND_PREFIX}
            </span>

            <div
              className={cn(
                "relative inline min-w-0 flex-1 whitespace-pre-wrap break-all font-mono",
                activeTheme.colors.text
              )}
            >
              <span>{beforeCursor}</span>
              <span className="relative inline-block">
                <span
                  className={cn(
                    suggestion
                      ? "text-muted-foreground opacity-60"
                      : activeTheme.colors.text
                  )}
                >
                  {suggestion ? suggestion[0] : afterCursor[0] || "\u00A0"}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-full",
                    activeTheme.colors.text === "text-primary"
                      ? "bg-primary"
                      : "bg-current",
                    caretVisible ? "opacity-100" : "opacity-0"
                  )}
                />
              </span>
              {suggestion.length > 1 && (
                <span className="text-muted-foreground opacity-60">
                  {suggestion.slice(1)}
                </span>
              )}
              <span>{suggestion ? afterCursor : afterCursor.slice(1)}</span>
              <input
                autoComplete="off"
                autoFocus
                className="absolute inset-0 z-10 m-0 h-full w-full border-none bg-transparent p-0 caret-transparent opacity-0 outline-none"
                id="terminal-input"
                onBlur={() => setIsFocused(false)}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e) => handleInputKeyDown(e)}
                onMouseUp={() => updateCaretFromInput()}
                onSelect={() => updateCaretFromInput()}
                ref={inputRef}
                spellCheck={false}
                type="text"
                value={input}
              />
            </div>
          </div>

          <div ref={endOfHistoryRef} />
        </div>
        <div className="flex flex-wrap px-2 text-primary lowercase">
          {/** biome-ignore lint/nursery/noLeakedRender: suppress */}
          {showCandidates && !!tabMatches?.length
            ? tabMatches?.map((match, index) => (
              <span
                className={cn(
                  "inline-block w-[200px] truncate px-1 text-sm",
                  index === tabIndex && "bg-primary text-primary-foreground",
                  activeTheme.colors.text !== "text-primary" &&
                  index === tabIndex &&
                  "bg-white text-black"
                )}
                key={match}
              >
                {match}
              </span>
            ))
            : null}
        </div>
      </div>
    </TooltipProvider >
  );
}
