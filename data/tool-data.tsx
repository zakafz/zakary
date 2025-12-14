export interface TableRowData {
  id: string;
  name: string;
  url?: string;
  category: string;
  description?: string;
  section?: string;
  children?: TableRowData[];
}

export const tools: TableRowData[] = [
  {
    id: "APPS",
    name: "Applications",
    category: "Tools",
    description: "Applications and ",
    children: [
      {
        id: "APPS-1",
        name: "Zed",
        url: "https://zed.dev/",
        category: "Editor",
        description: "Minimal code editor",
      },
      {
        id: "APPS-2",
        name: "Ghostty",
        url: "https://ghostty.org/",
        category: "Terminal",
        description: "Best terminal for macos",
      },
      {
        id: "APPS-3",
        name: "ElevenLabs",
        url: "https://elevenlabs.com/",
        category: "AI",
        description: "AI voice synthesis",
      },
      {
        id: "APPS-4",
        name: "Claude Code",
        url: "https://claude.com/",
        category: "CLI",
        description: "Claude in terminal",
      },
      {
        id: "APPS-5",
        name: "Framer",
        url: "https://www.framer.com/",
        category: "Website",
        description: "Site builder",
      },
      {
        id: "APPS-6",
        name: "Dia from BCNYC",
        url: "https://diabrowser.com/",
        category: "Browser",
        description: "AI powered browser",
      },
      {
        id: "APPS-7",
        name: "Cal.com",
        url: "https://cal.com/",
        category: "Calendar",
        description: "Best way to schedule meetings",
      },
      {
        id: "APPS-8",
        name: "Obsidian",
        url: "https://obsidian.md/",
        category: "Note",
        description: "Note-taking and knowledge management application",
      },
      {
        id: "APPS-9",
        name: "Spotify",
        url: "https://spotify.com/",
        category: "Music",
        description: "The ONLY acceptable music streaming service",
      },
    ],
  },
  {
    id: "CSTK",
    name: "Code stack",
    category: "Code",
    description: "Languages and frameworks used to build user interfaces",
    children: [
      {
        id: "CSTK-1",
        name: "Next.js",
        url: "https://nextjs.org",
        category: "Framework",
        description: "Best React framework for server-rendered and static apps",
      },
      {
        id: "CSTK-2",
        name: "Tauri 2.0",
        url: "https://tauri.app",
        category: "Framework",
        description: "Rust based framework for building desktop apps",
      },
      {
        id: "CSTK-3",
        name: "Electron",
        url: "https://electronjs.org",
        category: "Framework",
        description: "Cross-platform desktop app framework",
      },
      {
        id: "CSTK-4",
        name: "Golang",
        url: "https://golang.org",
        category: "Language",
        description: "To make backend apps",
      },
      {
        id: "CSTK-5",
        name: "Ultracite",
        url: "https://www.ultracite.ai/",
        category: "Linter/Formatter",
        description: "Linter and formatter preset for Biome",
      },
    ],
  },
  {
    id: "CLIB",
    name: "Component Libraries",
    category: "UI",
    description: "UI kits and component systems I use",
    children: [
      {
        id: "CLIB-1",
        name: "coss by Cal.com",
        url: "https://coss.com",
        category: "Library",
        description: "Component library built by Cal.com",
      },
      {
        id: "CLIB-2",
        name: "Roi UI",
        url: "https://roiui.com",
        category: "Library",
        description: "Lightweight component set",
      },
      {
        id: "CLIB-3",
        name: "Blocks",
        url: "https://blocks.so",
        category: "Library",
        description: "Library of reusable blocks",
      },
      {
        id: "CLIB-4",
        name: "Efferd",
        url: "https://efferd.com",
        category: "Library",
        description: "Marketing blocks",
      },
      {
        id: "CLIB-5",
        name: "svgl",
        url: "https://svgl.app",
        category: "Library",
        description: "SVG logo library",
      },
      {
        id: "CLIB-6",
        name: "Animate UI",
        url: "https://animate-ui.com",
        category: "Library",
        description: "Animated components library",
      },
      {
        id: "CLIB-7",
        name: "Animate Icons",
        url: "https://animate-ui.com/docs/icons",
        category: "Library",
        description: "Animated icon library",
      },
      {
        id: "CLIB-8",
        name: "Shadcn create",
        url: "https://ui.shadcn.com/create",
        category: "Component create",
        description: "Fully customizable shadcn starter",
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
    id: "PCKM",
    name: "Package Manager",
    category: "Code",
    description: "Package managers used for managing dependencies",
    children: [
      {
        id: "PCKM-1",
        name: "Bun",
        url: "https://bun.com",
        category: "Package Manager",
        description: "Super fast toolkit",
      },
      {
        id: "PCKM-2",
        name: "pnpm",
        url: "https://pnpm.io",
        category: "Package Manager",
        description: "Performant node package manager",
      },
    ],
  },
];
