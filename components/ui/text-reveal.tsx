"use client";

import { Reveal, type RevealProps } from "./reveal";

interface TextRevealProps extends Omit<RevealProps, "children"> {
  children: string;
}

export function TextReveal({ children, ...props }: TextRevealProps) {
  const characters = Array.from(children);

  return (
    <Reveal {...props}>
      {characters.map((char, index) => {
        // biome-ignore lint/nursery/noLeakedRender: for the animation
        const content = char === " " ? "\u00A0" : char;

        return (
          <span
            key={`${char}-${index}`}
            style={{
              display: "inline-block",
            }}
          >
            {content}
          </span>
        );
      })}
    </Reveal>
  );
}
