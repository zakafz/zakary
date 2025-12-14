import { Play, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogClose,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "./button/button";

// Interface for component props
interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
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
    ref,
  ) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div
            ref={ref}
            className={cn(
              "group relative cursor-pointer overflow-hidden border border-border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className,
            )}
            style={{ aspectRatio }}
            {...props}
          >
            {/* Thumbnail Image */}
            <Image
              src={thumbnailUrl}
              alt={`Thumbnail for ${title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              layout="fill"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center bg-(--mix-card-33-bg) border border-border backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 fill-muted-foreground text-muted-foreground group-hover:fill-primary group-hover:text-primary"
                  viewBox="0 0 512 512"
                >
                  <path d="M96 448l320-192L96 64v384z" />
                </svg>
              </div>
            </div>

            {/* Title and Description */}
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-2xl font-medium text-white">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-white/80">{description}</p>
              )}
            </div>
          </div>
        </DialogTrigger>

        {/* Video Modal */}
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="aspect-video flex flex-col justify-center items-center max-w-5xl border-0 bg-transparent p-0">
            <DialogTitle className="sr-only">Video Player</DialogTitle>
            <iframe
              src={videoUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-[95%] border-[0.5px] border-border/70 mx-auto"
            />
            <DialogClose asChild>
              <Button variant={"outline"} className="mt-5">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  },
);
VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
