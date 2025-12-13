"use client";

import { Reveal, type RevealProps } from "./reveal";

interface TextRevealProps extends Omit<RevealProps, "children"> {
  children: string;
}

export function TextReveal({ children, ...props }: TextRevealProps) {
  const characters = Array.from(children);

  return (
    <Reveal {...props}>
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={{
            display: "inline-block",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Reveal>
  );
}
