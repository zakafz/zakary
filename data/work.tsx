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
import { VideoPlayer } from "@/components/ui/video-player";
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

const CodeIllustration = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "mask-[linear-gradient(180deg,transparent_0%,#000_10%,#000_70%,transparent_100%)] w-full",
      className
    )}
  >
    <ul className="mx-auto w-fit pl-16 text-start font-medium font-mono text-2xl text-muted-foreground">
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
          className={cn(
            item === "Signups" &&
              "before:-translate-x-[110%] text-foreground before:absolute before:text-blue-500 before:content-['Track']"
          )}
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const workWithContent = workData.map((project) => {
  switch (project.id) {
    case "openpolicy":
      return {
        ...project,
        showcase: (
          <div className="mask-[linear-gradient(180deg,#000_0%,#000_40%,transparent_100%)] mx-auto mt-5 flex h-full w-[calc(100%-40px)] flex-col overflow-hidden bg-accent/70">
            <div className="flex h-fit items-center justify-between border-border/70 border-b-[0.5px] p-2 px-4 pt-4">
              <span className="flex gap-1 whitespace-nowrap font-medium text-sm">
                <Image
                  alt="Logo"
                  className="dark:invert"
                  height={16}
                  src="/icon-openpolicy.svg"
                  width={16}
                />
                OpenPolicy
              </span>
              <span className="font-mono text-muted-foreground text-xs">
                12/12/2025
              </span>
            </div>
            <div className="p-5 pb-0 text-justify text-muted-foreground text-xs">
              <div className="mb-1 font-medium text-primary">Heading 1</div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
              risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
              nec, ultricies sed, dolor. Cras elementum ultrices diam.
              <div className="mt-3 mb-1 font-medium text-primary">
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
            <div className="text-justify text-muted-foreground">
              OpenPolicy is a new open-source platform designed to simplify the
              creation, management, and publishing of legal and public
              documents. Whether you're a startup needing a Privacy Policy or an
              enterprise managing complex compliance documentation, OpenPolicy
              provides a solution that is both simple and secure.
            </div>
            <div className="mt-10 mb-5 font-medium">Features</div>
            <ul className="list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="font-medium text-primary">AI-Powered Writing</b>:
                Built-in AI Copilot for autocompletion and Command mode for
                generating, editing, and summarizing text.
              </li>
              <li>
                <b className="font-medium text-primary">Rich Text Editor</b>:
                Advanced editor with support for markdown, tables, and
                Excalidraw diagrams.
              </li>
              <li>
                <b className="font-medium text-primary">
                  Multi-Workspace Support
                </b>
                : Organize documents by team, project, or client with isolated
                workspaces. (Coming soon)
              </li>
              <li>
                <b className="font-medium text-primary">Custom Domain</b>:
                Connect your own domain (e.g., docs.acme.com) with automatic
                SSL.
              </li>
              <li>
                <b className="font-medium text-primary">Status Management</b>:
                Draft, Publish, and Archive states.
              </li>
              <li>
                <b className="font-medium text-primary">SEO Optimization</b>:
                Automatic dynamic metadata generation for better
                discoverability.
              </li>
              <li>
                <b className="font-medium text-primary">Custom branding</b>:
                Workspaces get unique slugs (e.g., acme.openpolicyhq.com).
              </li>
            </ul>
            <div className="mt-10 mb-5 font-medium">Why I built it?</div>
            <div className="text-justify text-muted-foreground">
              I built OpenPolicy because I wanted to try out{" "}
              <a
                className="font-medium text-primary hover:underline"
                href="https://polar.sh"
                rel="noopener noreferrer"
                target="_blank"
              >
                Polar.sh
              </a>
              , a fairly new payment infrastructure built on top of Stripe. It
              provides a simple way to create meters. Which can track usage and
              generate invoices based on those. Then I found out that the idea
              wasn't bad, so I decided to build it fully. I took inspiration
              from{" "}
              <a
                className="font-medium text-primary hover:underline"
                href="https://openstatus.dev"
                rel="noopener noreferrer"
                target="_blank"
              >
                Openstatus
              </a>{" "}
              for the design and the functionalities.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              My goal was really to work with things I never tried before, like
              the custom domain feature, which was surprisingly easy to
              implement. But then I doubled down on the production-readiness and
              made sure that the app was ready for production. And here we are!
              Now, I'm working on improving the app's performance and adding
              more features. Slowly but surely, we're making progress. And I'm
              excited to see where this project goes in the future.
            </div>
            <Image
              alt="LocalCard"
              className="mt-10 w-full"
              height={2000}
              src="/preview-openpolicy.png"
              width={4000}
            />
            <div className="mt-10 mb-5 font-medium">Tech stack</div>
            <ul className="list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="font-medium text-primary">Typescript</b>: Built on
                top of{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://nextjs.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Next.js
                </a>{" "}
                and{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://tailwindcss.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Tailwind CSS
                </a>
                .
              </li>
              <li>
                <b className="font-medium text-primary">Database + Auth</b>:{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://supabase.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Supabase
                </a>{" "}
                was the best choice for this project.
              </li>
              <li>
                <b className="font-medium text-primary">Rate limiting</b>: I
                decided to use{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://upstash.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Upstash Redis
                </a>{" "}
                to limit the number of requests per user.
              </li>
              <li>
                <b className="font-medium text-primary">Error handling</b>: My
                go-to error handling tool is{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://sentry.io"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Sentry
                </a>
                .
              </li>
              <li>
                <b className="font-medium text-primary">Editor</b>: Used{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://platejs.org"
                  rel="noopener noreferrer"
                  target="_blank"
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
          <div className="mx-auto flex h-full w-[calc(100%-40px)] flex-col items-start justify-center">
            <Image
              alt="LocalCard"
              className="mb-5 w-16"
              height={100}
              src="/icon-localcard.png"
              width={200}
            />
            <div className="grid w-full grid-cols-6 gap-2 border border-border bg-accent/70 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  className="flex aspect-square w-full items-center justify-center border border-green-500/30 bg-green-500/20 text-green-500/50"
                  key={`localcard-present-${i}`}
                >
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Checkmark</title>
                    <path d="M48 48v416h416V48zm170 312.38l-80.6-89.57 23.79-21.41 56 62.22L350 153.46 374.54 174z" />
                  </svg>
                </div>
              ))}

              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  className="flex aspect-square w-full items-center justify-center border border-border bg-(--mix-card-33-bg)"
                  key={`localcard-empty-${i}`}
                >
                  <div className="size-5 border border-border stroke-1.5 text-muted-foreground" />
                </div>
              ))}

              <div className="flex aspect-square w-full items-center justify-center border border-border bg-(--mix-card-33-bg)">
                <Gift className="size-6 text-green-500 dark:text-green-800" />
              </div>
            </div>
          </div>
        ),
        content: (
          <div>
            <div className="text-justify text-muted-foreground">
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
            <div className="text-justify text-muted-foreground">
              We made LocalCard for small businesses here in Montréal, Quebec,
              Canada. Our goal was to provide a simple, affordable, and
              effective solution that helps small businesses compete with larger
              chains. Our solution also gave businesses the chance to capture
              their clients phone numbers to then send them promotional messages
              (yes, everything was consented).
            </div>
            <Image
              alt="LocalCard"
              className="mt-10 w-full border-[0.5px] border-border/70"
              height={1000}
              src="/localcard-device.png"
              width={2000}
            />
            <div className="mt-2 text-muted-foreground text-xs">
              *Sorry, it’s in French. (This was a demo for a potential client,
              their store was pink, hence the theme.)
            </div>
            <Image
              alt="LocalCard"
              className="mt-10 w-full border-[0.5px] border-border/70"
              height={1000}
              src="/localcard-dev.JPG"
              width={2000}
            />
            <div className="mt-10 mb-5 font-medium">Did it fail?</div>
            <div className="text-justify text-muted-foreground">
              We managed to get a couple of clients, including a local franchise
              with eight stores. They saw a significant increase in sales after
              implementing LocalCard. What set us apart was being web-based, so
              clients didn’t have to install a useless mobile app. Let’s be
              real, who wants to download an app at the checkout counter?
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              But beyond that, I realized our pricing model wasn’t sustainable.
              We needed to conquer the whole Montréal to see meaningful revenue.
              So, slowly and sadly, we had to let go of LocalCard. We gave
              clients a 30-day notice, as stated in the contract, let them
              export their data, and had to say goodbye to the theme.
            </div>
            <div className="mt-10 mb-5 font-medium">Results</div>
            <div className="text-justify text-muted-foreground">
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
          <div className="flex h-full w-full items-center">
            <CodeIllustration />
          </div>
        ),
        content: (
          <div>
            <div className="text-justify text-muted-foreground">
              Measurely is an open-source analytics platform that makes
              tracking, analyzing, and visualizing metrics simple. With
              customizable metric types, real-time insights, and easy
              integrations, Measurely helps developers turn data into actionable
              insights for any project, all while maintaining full control over
              the data.
            </div>
            <div className="mt-10 mb-5 font-medium">Features</div>
            <ul className="list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="font-medium text-primary">
                  Developer-Friendly API
                </b>
                : Seamlessly integrate Measurely with your applications using an
                API key.
              </li>
              <li>
                <b className="font-medium text-primary">Real-Time Monitoring</b>
                : View and analyze your metrics as they update in real-time.
              </li>
              <li>
                <b className="font-medium text-primary">Custom Metric Types</b>:
                <ul className="mt-2 mb-2 list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
                  <li>
                    <b className="font-medium text-primary">Basic Metrics</b>:
                    Track single-value data points.
                  </li>
                  <li>
                    <b className="font-medium text-primary">Dual Metrics</b>:
                    Analyze trends with both positive and negative values.
                  </li>
                  <li>
                    <b className="font-medium text-primary">Advanced Options</b>
                    : Add offsets or custom tracking periods for granular
                    insights.
                  </li>
                </ul>
              </li>
              <li>
                <b className="font-medium text-primary">
                  Blocks for Data Visualization
                </b>
                : Create customizable charts and tables to visualize your data.
              </li>
              <li>
                <b className="font-medium text-primary">Team Management</b>:
                Collaborate with your team using role-based permissions.
              </li>
              <li>
                <b className="font-medium text-primary">
                  Was implementing (integrations)
                </b>
                : AWS CloudWatch, Google Analytics, and LemonSqueeze.
              </li>
            </ul>
            <VideoPlayer
              className="mt-10"
              description="What it is? Small demo of some features."
              thumbnailUrl="/measurely-thumbnail.jpg"
              title="Measurely"
              videoUrl="https://www.youtube.com/embed/ky-__c0YUmI?autoplay=1&vq=hd1080"
            />
            <div className="mt-10 mb-5 font-medium">Tech Stack</div>
            <ul className="list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="font-medium text-primary">Frontend</b>: Built on
                top of{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://nextra.site"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Nextra
                </a>
                ,{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://nextjs.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Next.js
                </a>{" "}
                and{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://tailwindcss.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Tailwind CSS
                </a>
                .
              </li>
              <li>
                <b className="font-medium text-primary">Backend</b>: Used{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://golang.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Golang
                </a>{" "}
                for speed.
              </li>
              <li>
                <b className="font-medium text-primary">Database</b>: We decided
                to use{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://upstash.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  PostgresSQL
                </a>
              </li>
              <li>
                <b className="font-medium text-primary">
                  Payment infrastructure
                </b>
                : Of course, we used{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://stripe.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Stripe
                </a>
                .
              </li>
            </ul>
            <ChartContainer
              className="mt-10 h-75 min-h-75 border-[0.5px] border-border/70 p-5 max-sm:h-75 max-sm:min-h-76"
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
            <ul className="list-outside list-disc space-y-2 pl-4 text-muted-foreground marker:text-primary">
              <li>
                <b className="font-medium text-primary">
                  Javascript/Typescript
                </b>
                :{" "}
                <a
                  className="font-medium text-primary underline"
                  href="https://github.com/measurely-dev/measurely-js"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Here
                </a>
              </li>
              <li>
                <b className="font-medium text-primary">Python</b>:{" "}
                <a
                  className="font-medium text-primary underline"
                  href="https://github.com/measurely-dev/measurely-py"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Here
                </a>
              </li>
              <li>
                <b className="font-medium text-primary">Golang</b>:{" "}
                <a
                  className="font-medium text-primary underline"
                  href="https://github.com/measurely-dev/measurely-go"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Here
                </a>
              </li>
            </ul>
            <div className="mt-10 mb-5 font-medium">Why we built it</div>
            <div className="text-justify text-muted-foreground">
              So, throwback to December 2024, me and my business partner were
              looking for something to build together. We ran through a bunch of
              ideas, but none of them felt truly useful.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              Around Christmas, I started thinking about a problem we had on a
              previous project: metric tracking. We wanted something extremely
              customizable and quick to use, with a clean SDK and easy
              implementation.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              That’s when <b className="font-medium text-primary">Measurely</b>{" "}
              was born. We jumped straight into prototyping and building an MVP.
              I was designing in Figma while my partner handled the backend
              structure.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              After a couple months of hard work, we had an MVP we were proud of
              and opened a waitlist. The thing is, during that time we had
              school :( Most days we couldn’t dedicate enough time to the
              project. We decided to take a break and focus on our studies.
              Unfortunately, we couldn’t keep pushing Measurely because of our
              schedules.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              Since then, I told myself I’d never put school over my projects,
              and it worked. I kept grinding on other projects, sharpening my
              skills in frontend development.
            </div>
            <div className="mt-5 text-justify text-muted-foreground">
              Maybe one day I’ll start working on Measurely again.{" "}
              <b className="font-medium text-primary">Who knows?</b> For now,
              I’ve got other projects to build.
            </div>
          </div>
        ),
      };
    case "maybe-you":
      return {
        ...project,
        showcase: (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex aspect-square w-[40%] items-center justify-center border border-border bg-accent/70 text-7xl text-muted-foreground">
              ?
            </div>
          </div>
        ),
        content: <div />,
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
