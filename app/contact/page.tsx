import { type LucideIcon, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { GitHub } from "@/components/ui/github-icon";
import { LinkedIn } from "@/components/ui/linkedin-icon";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import { cn } from "@/lib/utils";

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
              icon={Mail}
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
              icon={MapPin}
              title="Location"
            >
              <span className="font-medium font-mono text-sm tracking-wide">
                Based in Montréal, QC, Canada
              </span>
            </Box>
            <Box
              className="border-border/70 border-b-0 md:border-r-0"
              description="Call me for a chat."
              icon={Phone}
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
  icon: LucideIcon;
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
        className
      )}
    >
      <div className="flex items-center gap-x-3 border-border/70 border-b-[0.5px] bg-secondary/50 p-4 dark:bg-secondary/20">
        <props.icon className="size-5 text-muted-foreground" strokeWidth={1} />
        <h2 className="font-heading font-medium text-lg tracking-wider">
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
