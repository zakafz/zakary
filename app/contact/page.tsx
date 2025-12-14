import { type LucideIcon, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { GitHub } from "@/components/ui/github-icon";
import { LinkedIn } from "@/components/ui/linkedin-icon";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { ReactNode } from "react";

export default function ContactPage() {
  const APP_EMAIL = "hello@zakary.dev";
  const APP_PHONE = "+1 (438) 929-8554";

  const socialLinks = [
    {
      icon: GitHub,
      href: "https://github.com/zakafz",
      label: "GitHub",
    },
    {
      icon: LinkedIn,
      href: "https://linkedin.com/in/zakary-fofana",
      label: "linkedin",
    },
  ];

  return (
    <Container>
      <Header />
      <div className="mx-auto min-h-[calc(100vh-56px-80px)] w-full pt-10 md:pt-40">
        <TextReveal
          className="mb-5 font-medium text-lg"
          display="block"
          variant="slideDown"
        >
          Contact me
        </TextReveal>
        <Reveal display="block" variant="slideUp">
          <div className="grid w-full border-[0.5px] border-border/70 md:grid-cols-3">
            <Box
              description="I try to respond to all emails within 24 hours."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 text-muted-foreground"
                  strokeWidth={1}
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M464 80H48a16 16 0 00-16 16v320a16 16 0 0016 16h416a16 16 0 0016-16V96a16 16 0 00-16-16zM265.82 284.63a16 16 0 01-19.64 0L89.55 162.81l19.64-25.26L256 251.73l146.81-114.18 19.64 25.26z" />
                </svg>
              }
              title="Email"
            >
              <a
                className="font-medium font-mono text-sm tracking-wide hover:underline"
                href={`mailto:${APP_EMAIL}`}
              >
                {APP_EMAIL}
              </a>
            </Box>
            <Box
              description="Open to relocation :)"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 text-muted-foreground"
                  strokeWidth={1}
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M256 32C167.67 32 96 96.51 96 176c0 128 160 304 160 304s160-176 160-304c0-79.49-71.67-144-160-144zm0 224a64 64 0 1164-64 64.07 64.07 0 01-64 64z" />
                </svg>
              }
              title="Location"
            >
              <span className="font-medium font-mono text-sm tracking-wide">
                Based in Montréal, QC, Canada
              </span>
            </Box>
            <Box
              className="border-border/70 border-b-0 md:border-r-0"
              description="Call me for a chat."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 text-muted-foreground"
                  strokeWidth={1}
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M478.94 370.14c-5.22-5.56-23.65-22-57.53-43.75-34.13-21.94-59.3-35.62-66.52-38.81a3.83 3.83 0 00-3.92.49c-11.63 9.07-31.21 25.73-32.26 26.63-6.78 5.81-6.78 5.81-12.33 4-9.76-3.2-40.08-19.3-66.5-45.78s-43.35-57.55-46.55-67.3c-1.83-5.56-1.83-5.56 4-12.34.9-1.05 17.57-20.63 26.64-32.25a3.83 3.83 0 00.49-3.92c-3.19-7.23-16.87-32.39-38.81-66.52-21.78-33.87-38.2-52.3-43.76-57.52a3.9 3.9 0 00-3.89-.87 322.35 322.35 0 00-56 25.45A338 338 0 0033.35 92a3.83 3.83 0 00-1.26 3.74c2.09 9.74 12.08 50.4 43.08 106.72 31.63 57.48 53.55 86.93 100 133.22S252 405.21 309.54 436.84c56.32 31 97 41 106.72 43.07a3.86 3.86 0 003.75-1.26A337.73 337.73 0 00454.35 430a322.7 322.7 0 0025.45-56 3.9 3.9 0 00-.86-3.86z" />
                </svg>
              }
              title="Phone"
            >
              <div>
                <a
                  className="block font-medium font-mono text-sm tracking-wide hover:underline"
                  href={`tel:${APP_PHONE}`}
                >
                  {APP_PHONE}
                </a>
              </div>
            </Box>
          </div>
        </Reveal>
        <div className="z-1 flex h-full flex-col justify-center gap-4 pt-10">
          <h2 className="flex items-center gap-1 font-medium text-lg text-muted-foreground tracking-tight">
            <TextReveal variant="slideUp">Find me</TextReveal>{" "}
            <TextReveal
              className="text-foreground"
              delay={0.7}
              variant="slideDown"
            >
              online
            </TextReveal>
          </h2>
          <Reveal delay={0.2} variant="slideDown">
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  className="flex items-center gap-x-2 border-[0.5px] border-border/70 bg-card px-3 py-1.5 shadow hover:bg-accent"
                  href={link.href}
                  key={link.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <link.icon className="size-3.5 text-muted-foreground" />
                  <span className="font-medium font-mono text-xs tracking-wide">
                    {link.label}
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
      <Footer />
    </Container>
  );
}

type ContactBox = React.ComponentProps<"div"> & {
  icon: ReactNode;
  title: string;
  description: string;
};

function Box({
  title,
  description,
  className,
  children,
  ...props
}: ContactBox) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border-border/70 border-b-[0.5px] md:border-r-[0.5px] md:border-b-0",
        className,
      )}
    >
      <div className="flex items-center gap-x-3 border-border/70 border-b-[0.5px] bg-secondary/50 p-4 dark:bg-secondary/20">
        {props.icon}
        <h2 className="font-heading font-medium text-xl tracking-wider font-serif">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-x-2 p-4 py-12">{children}</div>
      <div className="border-border/70 border-t-[0.5px] p-4">
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
