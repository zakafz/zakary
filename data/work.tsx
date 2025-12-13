"use client";

import { Gift } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart/chart";
import VideoPlayer from "@/components/ui/video-player";
import { cn } from "@/lib/utils";
import { workData } from "./work-data";

const chartData = [
  { month: "Jan", "Page visits": 100 },
  { month: "Feb", "Page visits": 480 },
  { month: "Mar", "Page visits": 300 },
  { month: "Apr", "Page visits": 250 },
  { month: "May", "Page visits": 500 },
  { month: "Jun", "Page visits": 150 },
  { month: "Jul", "Page visits": 325 },
  { month: "Aug", "Page visits": 475 },
];
const chartConfig = {
  sales: {
    label: "Page Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
const ANIMATION_DURATION = 500;
const BAR_RADIUS: [number, number, number, number] = [0, 0, 0, 0];

const CodeIllustration = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "mask-[linear-gradient(180deg,transparent_0%,#000_10%,#000_70%,transparent_100%)] w-full",
        className,
      )}
    >
      <ul className="text-muted-foreground mx-auto w-fit font-mono text-2xl font-medium text-start pl-16">
        {[
          "Page Visits",
          "Unique visitors",
          "Bounce rate",
          "Signups",
          "Deleted items",
          "Meters",
          "Storage usage",
        ].map((item) => (
          <li
            key={item}
            className={cn(
              item === "Signups" &&
                "text-foreground before:absolute before:-translate-x-[110%] before:text-blue-500 before:content-['Track']",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const workWithContent = workData.map((project) => {
  switch (project.id) {
    case "openpolicy":
      return {
        ...project,
        showcase: (
          <div className="w-[calc(100%-40px)] mt-5 h-full bg-accent/70 mask-[linear-gradient(180deg,#000_0%,#000_40%,transparent_100%)] mx-auto flex flex-col overflow-hidden">
            <div className="border-b-[0.5px] h-fit border-border/70 p-2 pt-4 px-4 flex justify-between items-center ">
              <span className="font-medium text-sm flex whitespace-nowrap gap-1">
                <Image
                  src="/icon-openpolicy.svg"
                  className="dark:invert"
                  alt="Logo"
                  width={16}
                  height={16}
                />
                OpenPolicy
              </span>
              <span className="text-muted-foreground text-xs font-mono">
                12/12/2025
              </span>
            </div>
            <div className="p-5 pb-0 text-xs text-justify text-muted-foreground">
              <div className="font-medium text-primary mb-1">Heading 1</div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
              risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
              nec, ultricies sed, dolor. Cras elementum ultrices diam.
              <div className="font-medium text-primary mt-3 mb-1">
                Heading 2
              </div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
              risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
              nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas
              ligula massa, varius a, semper congue, euismod non, mi.
            </div>
          </div>
        ),
        content: (
          <>
            <div className="text-muted-foreground text-justify">
              OpenPolicy is a new open-source platform designed to simplify the
              creation, management, and publishing of legal and public
              documents. Whether you're a startup needing a Privacy Policy or an
              enterprise managing complex compliance documentation, OpenPolicy
              provides a solution that is both simple and secure.
            </div>
            <div className="mt-10 mb-5 font-medium">Features</div>
            <ul className="list-disc list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="text-primary font-medium">AI-Powered Writing</b>:
                Built-in AI Copilot for autocompletion and Command mode for
                generating, editing, and summarizing text.
              </li>
              <li>
                <b className="text-primary font-medium">Rich Text Editor</b>:
                Advanced editor with support for markdown, tables, and
                Excalidraw diagrams.
              </li>
              <li>
                <b className="text-primary font-medium">
                  Multi-Workspace Support
                </b>
                : Organize documents by team, project, or client with isolated
                workspaces. (Coming soon)
              </li>
              <li>
                <b className="text-primary font-medium">Custom Domain</b>:
                Connect your own domain (e.g., docs.acme.com) with automatic
                SSL.
              </li>
              <li>
                <b className="text-primary font-medium">Status Management</b>:
                Draft, Publish, and Archive states.
              </li>
              <li>
                <b className="text-primary font-medium">SEO Optimization</b>:
                Automatic dynamic metadata generation for better
                discoverability.
              </li>
              <li>
                <b className="text-primary font-medium">Custom branding</b>:
                Workspaces get unique slugs (e.g., acme.openpolicyhq.com).
              </li>
            </ul>
            <div className="mt-10 mb-5 font-medium">Why I built it?</div>
            <div className="text-muted-foreground text-justify">
              I built LocalCard because I wanted to try out{" "}
              <a
                href="https://polar.sh"
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Polar.sh
              </a>
              , a fairly new payment infrastructure built on top of Stripe. It
              provides a simple way to create meters. Which can track usage and
              generate invoices based on those. Then I found out that the idea
              wasn't bad, so I decided to build it fully. I took inspiration
              from{" "}
              <a
                href="https://openstatus.dev"
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Openstatus
              </a>{" "}
              for the design and the functionalities.
            </div>
            <div className="text-muted-foreground mt-5 text-justify">
              My goal was really to work with things I never tried before, like
              the custom domain feature, which was surprisingly easy to
              implement. But then I doubled down on the production-readiness and
              made sure that the app was ready for production. And here we are!
              Now, I'm working on improving the app's performance and adding
              more features. Slowly but surely, we're making progress. And I'm
              excited to see where this project goes in the future.
            </div>
            <Image
              src="/preview-openpolicy.png"
              className="w-full mt-10"
              alt="LocalCard"
              width={4000}
              height={2000}
            />
            <div className="mt-10 mb-5 font-medium">Tech stack</div>
            <ul className="list-disc list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="text-primary font-medium">Typescript</b>: Built on
                top of{" "}
                <a
                  href="https://nextjs.org"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Next.js
                </a>{" "}
                and{" "}
                <a
                  href="https://tailwindcss.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tailwind CSS
                </a>
                .
              </li>
              <li>
                <b className="text-primary font-medium">Database + Auth</b>:{" "}
                <a
                  href="https://supabase.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase
                </a>{" "}
                was the best choice for this project.
              </li>
              <li>
                <b className="text-primary font-medium">Rate limiting</b>: I
                decided to use{" "}
                <a
                  href="https://upstash.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upstash Redis
                </a>{" "}
                to limit the number of requests per user.
              </li>
              <li>
                <b className="text-primary font-medium">Error handling</b>: My
                go-to error handling tool is{" "}
                <a
                  href="https://sentry.io"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sentry
                </a>
                .
              </li>
              <li>
                <b className="text-primary font-medium">Editor</b>: Used{" "}
                <a
                  href="https://platejs.org"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PlateJS
                </a>{" "}
                for the editor.
              </li>
            </ul>
          </>
        ),
      };
    case "localcard":
      return {
        ...project,
        showcase: (
          <div className="w-[calc(100%-40px)] mx-auto h-full flex flex-col justify-center items-start">
            <Image
              src="/icon-localcard.png"
              className="w-16 mb-5"
              alt="LocalCard"
              width={200}
              height={100}
            />
            <div className="w-full p-4 bg-accent/70 border-border border grid gap-2 grid-cols-6">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: These are decorative elements and the order is stable. */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`localcard-present-${i}`}
                  className="w-full aspect-square border-green-500/30 border bg-green-500/20 text-green-500/50 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="size-6"
                    fill="currentColor"
                  >
                    <title>Checkmark</title>
                    <path d="M48 48v416h416V48zm170 312.38l-80.6-89.57 23.79-21.41 56 62.22L350 153.46 374.54 174z" />
                  </svg>
                </div>
              ))}

              {/* biome-ignore lint/suspicious/noArrayIndexKey: These are decorative elements and the order is stable. */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`localcard-empty-${i}`}
                  className="w-full aspect-square border-border border bg-(--mix-card-33-bg) flex items-center justify-center"
                >
                  <div className="size-5 text-muted-foreground stroke-1.5 border border-border" />
                </div>
              ))}

              <div className="w-full aspect-square border-border border bg-(--mix-card-33-bg) flex items-center justify-center">
                <Gift className="size-6 text-green-500 dark:text-green-800" />
              </div>
            </div>
          </div>
        ),
        content: (
          <div>
            <div className="text-muted-foreground text-justify">
              Co-founded LocalCard, a digital loyalty platform that enables
              local businesses to reward and retain customers using phone
              numbers for easy rewards. Customers do not need apps or physical
              cards. I designed and launched secure, user-friendly tablet
              dashboards so merchants can set up loyalty programs without
              complicated POS integrations. My focus is to deliver simple,
              affordable, and effective solutions that help small businesses
              compete with larger chains.
            </div>
            <div className="mt-10 mb-5 font-medium">Who is it for?</div>
            <div className="text-muted-foreground text-justify">
              We made LocalCard for small businesses here in Montréal, Quebec,
              Canada. Our goal was to provide a simple, affordable, and
              effective solution that helps small businesses compete with larger
              chains. Our solution also gave businesses the chance to capture
              their clients phone numbers to then send them promotional messages
              (yes, everything was consented).
            </div>
            <Image
              src="/localcard-device.png"
              className="w-full mt-10 border-[0.5px] border-border/70"
              alt="LocalCard"
              width={2000}
              height={1000}
            />
            <div className="text-muted-foreground text-xs mt-2">
              *Sorry, it’s in French. (This was a demo for a potential client,
              their store was pink, hence the theme.)
            </div>
            <Image
              src="/localcard-dev.JPG"
              className="w-full mt-10 border-[0.5px] border-border/70"
              alt="LocalCard"
              width={2000}
              height={1000}
            />
            <div className="mt-10 mb-5 font-medium">Did it fail?</div>
            <div className="text-muted-foreground text-justify">
              We managed to get a couple of clients, including a local franchise
              with eight stores. They saw a significant increase in sales after
              implementing LocalCard. What set us apart was being web-based, so
              clients didn’t have to install a useless mobile app. Let’s be
              real, who wants to download an app at the checkout counter?
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              But beyond that, I realized our pricing model wasn’t sustainable.
              We needed to conquer the whole Montréal to see meaningful revenue.
              So, slowly and sadly, we had to let go of LocalCard. We gave
              clients a 30-day notice, as stated in the contract, let them
              export their data, and had to say goodbye to the theme.
            </div>
            <div className="mt-10 mb-5 font-medium">Results</div>
            <div className="text-muted-foreground text-justify">
              I believe that it was a great experience, and I learned a lot from
              it. For exemple: validate your model before getting too far or you
              WILL lose clients.
            </div>
          </div>
        ),
      };
    case "measurely":
      return {
        ...project,
        showcase: (
          <div className="w-full h-full items-center flex">
            <CodeIllustration />
          </div>
        ),
        content: (
          <div>
            <div className="text-muted-foreground text-justify">
              Measurely is an open-source analytics platform that makes
              tracking, analyzing, and visualizing metrics simple. With
              customizable metric types, real-time insights, and easy
              integrations, Measurely helps developers turn data into actionable
              insights for any project, all while maintaining full control over
              the data.
            </div>
            <div className="mt-10 mb-5 font-medium">Features</div>
            <ul className="list-disc list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="text-primary font-medium">
                  Developer-Friendly API
                </b>
                : Seamlessly integrate Measurely with your applications using an
                API key.
              </li>
              <li>
                <b className="text-primary font-medium">Real-Time Monitoring</b>
                : View and analyze your metrics as they update in real-time.
              </li>
              <li>
                <b className="text-primary font-medium">Custom Metric Types</b>:
                <ul className="list-disc mt-2 mb-2 list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
                  <li>
                    <b className="text-primary font-medium">Basic Metrics</b>:
                    Track single-value data points.
                  </li>
                  <li>
                    <b className="text-primary font-medium">Dual Metrics</b>:
                    Analyze trends with both positive and negative values.
                  </li>
                  <li>
                    <b className="text-primary font-medium">Advanced Options</b>
                    : Add offsets or custom tracking periods for granular
                    insights.
                  </li>
                </ul>
              </li>
              <li>
                <b className="text-primary font-medium">
                  Blocks for Data Visualization
                </b>
                : Create customizable charts and tables to visualize your data.
              </li>
              <li>
                <b className="text-primary font-medium">Team Management</b>:
                Collaborate with your team using role-based permissions.
              </li>
              <li>
                <b className="text-primary font-medium">
                  Was implementing (integrations)
                </b>
                : AWS CloudWatch, Google Analytics, and LemonSqueeze.
              </li>
            </ul>
            <VideoPlayer src="/measurely.mp4" className="mt-10" />
            <div className="mt-10 mb-5 font-medium">Tech Stack</div>
            <ul className="list-disc list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="text-primary font-medium">Frontend</b>: Built on
                top of{" "}
                <a
                  href="https://nextra.site"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nextra
                </a>
                ,{" "}
                <a
                  href="https://nextjs.org"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Next.js
                </a>{" "}
                and{" "}
                <a
                  href="https://tailwindcss.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tailwind CSS
                </a>
                .
              </li>
              <li>
                <b className="text-primary font-medium">Backend</b>: Used{" "}
                <a
                  href="https://golang.org"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Golang
                </a>{" "}
                for speed.
              </li>
              <li>
                <b className="text-primary font-medium">Database</b>: We decided
                to use{" "}
                <a
                  href="https://upstash.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PostgresSQL
                </a>
              </li>
              <li>
                <b className="text-primary font-medium">
                  Payment infrastructure
                </b>
                : Of course, we used{" "}
                <a
                  href="https://stripe.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe
                </a>
                .
              </li>
            </ul>
            <ChartContainer
              className="h-75 min-h-75 max-sm:h-75 max-sm:min-h-76 border-[0.5px] border-border/70 p-5 mt-10"
              config={chartConfig}
            >
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  domain={[0, "auto"]}
                  tickLine={false}
                  tickMargin={8}
                  width={40}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const numValue =
                          typeof value === "number"
                            ? value
                            : Number.parseFloat(String(value));
                        return `${numValue.toLocaleString()}`;
                      }}
                    />
                  }
                />
                <Bar
                  animationDuration={ANIMATION_DURATION}
                  dataKey="Page visits"
                  fill="var(--color-sales)"
                  radius={BAR_RADIUS}
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-10 mb-5 font-medium">SDKs</div>
            <ul className="list-disc list-outside space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="text-primary font-medium">
                  Javascript/Typescript
                </b>
                :{" "}
                <a
                  href="https://github.com/measurely-dev/measurely-js"
                  className="text-primary font-medium underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Here
                </a>
              </li>
              <li>
                <b className="text-primary font-medium">Python</b>:{" "}
                <a
                  href="https://github.com/measurely-dev/measurely-py"
                  className="text-primary font-medium underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Here
                </a>
              </li>
              <li>
                <b className="text-primary font-medium">Golang</b>:{" "}
                <a
                  href="https://github.com/measurely-dev/measurely-go"
                  className="text-primary font-medium underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Here
                </a>
              </li>
            </ul>
            <div className="mt-10 mb-5 font-medium">Why we built it</div>
            <div className="text-muted-foreground text-justify">
              So, throwback to December 2024, me and my business partner were
              looking for something to build together. We ran through a bunch of
              ideas, but none of them felt truly useful.
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              Around Christmas, I started thinking about a problem we had on a
              previous project: metric tracking. We wanted something extremely
              customizable and quick to use, with a clean SDK and easy
              implementation.
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              That’s when <b className="text-primary font-medium">Measurely</b>{" "}
              was born. We jumped straight into prototyping and building an MVP.
              I was designing in Figma while my partner handled the backend
              structure.
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              After a couple months of hard work, we had an MVP we were proud of
              and opened a waitlist. The thing is, during that time we had
              school :( Most days we couldn’t dedicate enough time to the
              project. We decided to take a break and focus on our studies.
              Unfortunately, we couldn’t keep pushing Measurely because of our
              schedules.
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              Since then, I told myself I’d never put school over my projects,
              and it worked. I kept grinding on other projects, sharpening my
              skills in frontend development.
            </div>
            <div className="text-muted-foreground text-justify mt-5">
              Maybe one day I’ll start working on Measurely again.{" "}
              <b className="text-primary font-medium">Who knows?</b> For now,
              I’ve got other projects to build.
            </div>
          </div>
        ),
      };
    case "maybe-you":
      return {
        ...project,
        showcase: (
          <div className="w-full h-full flex justify-center items-center">
            <div className="flex items-center justify-center text-7xl text-muted-foreground w-[40%] bg-accent/70 aspect-square border border-border">
              ?
            </div>
          </div>
        ),
        content: <div></div>,
      };
    default:
      return {
        ...project,
        showcase: null,
        content: null,
      };
  }
});

export const work = workWithContent;

export type Work = (typeof work)[number];
