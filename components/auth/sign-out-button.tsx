"use client";

import { LogOutIcon, MoreVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-label="Account menu"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-none text-muted-foreground transition-colors hover:text-foreground"
      >
        <MoreVerticalIcon className="size-5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 rounded-none p-1">
        <button
          className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary disabled:opacity-50"
          disabled={loading}
          onClick={() => {
            setOpen(false);
            signOut();
          }}
          type="button"
        >
          <LogOutIcon className="size-3.5" />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  );
}
