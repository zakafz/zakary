"use client";
import { RefreshCcw } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button/button";
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
  text: string;
  isCommand: boolean;
  isPlaceholder?: boolean;
};

type Commands = {
  [key: string]: {
    description: string;
    fn: () => string | null;
  };
};

const LEADING_SPACES_REGEX = /^\s*/;

export default function FakeTerminal() {
  const COMMAND_PREFIX = "user@zakary.dev";

  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([
    { text: "Commands: help, about, socials, clear", isCommand: false },
  ]);

  const endOfHistoryRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [caretPos, setCaretPos] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [caretVisible, setCaretVisible] = useState<boolean>(true);

  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [savedInputBeforeHistory, setSavedInputBeforeHistory] =
    useState<string>("");

  const [tabMatches, setTabMatches] = useState<string[] | null>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [lastTabInput, setLastTabInput] = useState<string>("");

  const [suggestion, setSuggestion] = useState<string>("");

  const commands: Commands = {
    help: {
      description: "Show all available commands.",
      fn: () => "Commands: help, about, socials, clear",
    },
    about: {
      description: "Learn more about me.",
      fn: () => "My name is Zakary. I am a software engineer and designer.",
    },
    socials: {
      description: "Find me on social media.",
      fn: () =>
        "You can find me on GitHub: https://github.com/your-username and LinkedIn: https://linkedin.com/in/your-username",
    },
    clear: {
      description: "Clear the terminal.",
      fn: () => {
        setHistory([]);
        return null;
      },
    },
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: suppress
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setTabIndex(0);
    setLastTabInput("");
    setSuggestion("");
  };

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    const pos = e.target.selectionStart ?? value.length;
    setCaretPos(pos);

    setTabMatches(null);
    setTabIndex(0);
    setLastTabInput("");
    setSuggestion("");

    if (historyIndex !== -1) {
      setHistoryIndex(-1);
    }
  };

  const findMatches = (partial: string) => {
    const keys = Object.keys(commands);
    const low = partial.toLowerCase();
    return keys.filter((k) => k.startsWith(low));
  };

  const applyCompletion = (completion: string) => {
    const current = input;
    const leadingSpacesMatch = current.match(LEADING_SPACES_REGEX);
    const leading = leadingSpacesMatch ? leadingSpacesMatch[0] : "";
    const firstSpaceIndex = current.indexOf(" ", leading.length);
    const remainder =
      firstSpaceIndex === -1 ? "" : current.slice(firstSpaceIndex);
    const newInput = `${leading}${completion}${remainder}`;
    setInput(newInput);
    setSuggestion("");
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: suppress
  useEffect(() => {
    computeSuggestion();
  }, [input, caretPos]);

  const handleTabKey = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const leadingMatch = input.match(LEADING_SPACES_REGEX);
    const leadingLen = leadingMatch ? leadingMatch[0].length : 0;
    const firstSpace = input.indexOf(" ", leadingLen);
    const tokenEnd = firstSpace === -1 ? input.length : firstSpace;
    const partial = input.slice(leadingLen, tokenEnd);

    if (tabMatches === null || lastTabInput !== partial) {
      const matches = findMatches(partial);
      if (matches.length === 0) {
        return;
      }
      setTabMatches(matches);
      setTabIndex(0);
      setLastTabInput(partial);
      applyCompletion(matches[0]);
      return;
    }

    if (!tabMatches || tabMatches.length === 0) {
      return;
    }
    const next = (tabIndex + 1) % tabMatches.length;
    setTabIndex(next);
    applyCompletion(tabMatches[next]);
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
    if (lower === "clear") {
      setHistory([]);
      resetInput();
      focusInput();
      return;
    }

    const first = raw.split(" ")[0].toLowerCase();

    const commandLine: HistoryItem = {
      text: `${COMMAND_PREFIX} ${raw}`,
      isCommand: true,
    };

    const outputItem = (() => {
      const maybe = commands[first]?.fn;
      if (!maybe) {
        return null;
      }
      const out = maybe();
      return out ? { text: out, isCommand: false } : null;
    })();

    setHistory((prev) => {
      const filtered = prev.filter((p) => !p.isPlaceholder);
      const items: HistoryItem[] = [commandLine];
      if (outputItem) {
        items.push(outputItem);
      } else {
        items.push({
          text: "Command not found",
          isCommand: false,
        });
      }
      return [...filtered, ...items];
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
      handleEnterKey(e);
      return;
    }

    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.key === "Backspace" ||
      e.key === "Delete"
    ) {
      handleNavigationKeys();
    }
  };

  const handleWrapperClick = () => inputRef.current?.focus();

  const handleClear = () => {
    setHistory([
      { text: "Commands: help, about, socials, clear", isCommand: false },
    ]);
    inputRef.current?.focus();
  };

  const handleWrapperKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const key = e.key;
    const code = e.code;

    if (key === "Enter") {
      inputRef.current?.focus();
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

  return (
    <TooltipProvider>
      <div className="mb-20 flex flex-col border-[0.5px] border-border bg-(--mix-card-33-bg) font-mono">
        <div className="flex items-center justify-between border-border border-b-[0.5px] p-2">
          <span className="text-primary text-sm">
            <span className="text-muted-foreground">terminal:</span>
            {` ${COMMAND_PREFIX}`}
          </span>
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
        </div>

        <button
          aria-label="Terminal"
          className="flex h-[60vh] w-full select-text flex-col overflow-y-auto p-2 text-left text-primary text-sm"
          onClick={handleWrapperClick}
          onKeyDown={handleWrapperKeyDown}
          tabIndex={0}
          type="button"
        >
          <div>
            {history.map((item, index) => {
              if (!item.isCommand) {
                return (
                  <div className="mb-1" key={index}>
                    {item.text}
                  </div>
                );
              }
              const prefix = COMMAND_PREFIX;
              const rest = item.text.startsWith(prefix)
                ? item.text.slice(prefix.length)
                : item.text;
              return (
                <div className="mb-1" key={index}>
                  <span className="text-blue-700 dark:text-blue-300">
                    {prefix}
                  </span>
                  <span>{rest}</span>
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-wrap break-all">
            <span className="mr-2 shrink-0 text-blue-700 dark:text-blue-300">
              {COMMAND_PREFIX}
            </span>

            <div className="relative inline min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-primary">
              <span>{beforeCursor}</span>
              <span className="relative inline-block">
                <span
                  className={cn(
                    suggestion
                      ? "text-muted-foreground opacity-60"
                      : "text-primary"
                  )}
                >
                  {suggestion ? suggestion[0] : afterCursor[0] || "\u00A0"}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-full bg-primary",
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
        </button>
      </div>
    </TooltipProvider>
  );
}
