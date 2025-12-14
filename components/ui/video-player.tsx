import Image from "next/image";
import { type ElementRef, forwardRef, type HTMLAttributes } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "./button/button";

// Interface for component props
interface VideoPlayerProps extends HTMLAttributes<HTMLDivElement> {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

const VideoPlayer = forwardRef<ElementRef<"div">, VideoPlayerProps>(
  (
    {
      className,
      thumbnailUrl,
      videoUrl,
      title,
      description,
      aspectRatio = "16/9",
      ...props
    },
    ref
  ) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div
            className={cn(
              "group relative cursor-pointer overflow-hidden border border-border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className
            )}
            ref={ref}
            style={{ aspectRatio }}
            {...props}
          >
            {/* Thumbnail Image */}
            <Image
              alt={`Thumbnail for ${title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              layout="fill"
              src={thumbnailUrl}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-(--mix-card-33-bg) backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                <svg
                  className="h-8 w-8 fill-muted-foreground text-muted-foreground group-hover:fill-primary group-hover:text-primary"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Play Video</title>
                  <path d="M96 448l320-192L96 64v384z" />
                </svg>
              </div>
            </div>

            {/* Title and Description */}
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="font-medium text-2xl text-white">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-white/80">{description}</p>
              ) : null}
            </div>
          </div>
        </DialogTrigger>

        {/* Video Modal */}
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="flex aspect-video max-w-5xl flex-col items-center justify-center border-0 bg-transparent p-0">
            <DialogTitle className="sr-only">Video Player</DialogTitle>
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="mx-auto h-full w-[95%] border-[0.5px] border-border/70"
              frameBorder="0"
              src={videoUrl}
              title={title}
            />
            <DialogClose asChild>
              <Button className="mt-5" variant={"outline"}>
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }
);
VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
