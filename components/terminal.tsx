"use client";
import Terminal from "react-console-emulator";

const commands = {
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
      // This command is handled by the terminal itself.
    },
  },
};

export default function FakeTerminal() {
  return (
    <Terminal
      commands={commands}
      inputStyle={{ color: "#ffffff" }}
      promptLabel={"~"}
      promptLabelStyle={{ color: "#a9a9a9" }}
      style={{
        backgroundColor: "#1a1a1a",
        minHeight: "300px",
        maxHeight: "300px",
        overflow: "auto",
        borderRadius: "8px",
      }}
      welcomeMessage={
        "Welcome to my terminal! Type 'help' to see available commands."
      }
    />
  );
}
