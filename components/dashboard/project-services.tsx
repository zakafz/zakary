"use client";

import { PencilIcon, PlusIcon, TagIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { money, type ProjectService } from "@/data/receipts";
import { createClient } from "@/lib/supabase/client";

function ServiceDrawer({
  service,
  open,
  onOpenChange,
  onSave,
}: {
  service: ProjectService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, price: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (open) {
      setName(service?.name ?? "");
      setPrice(service ? String(service.price) : "");
    }
  }, [open, service]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    await onSave(name.trim(), Number.parseFloat(price) || 0);
    onOpenChange(false);
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-5">
            <DrawerClose>
              <Button className="rounded-none" size="icon-sm" variant="outline">
                <XIcon />
              </Button>
            </DrawerClose>
            <DrawerTitle>
              {service ? "Edit service" : "New service"}
            </DrawerTitle>
          </div>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          id="service-form"
          onSubmit={submit}
        >
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-sm">
              Service name
            </span>
            <Input
              autoFocus
              className="rounded-none border-border"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chrome delete"
              value={name}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-sm">
              Default price
            </span>
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground text-sm">
                $
              </span>
              <Input
                className="no-spinner rounded-none border-border pl-7"
                inputMode="decimal"
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={price}
              />
            </div>
          </div>
        </form>
        <DrawerFooter className="pb-5">
          <Button
            className="w-full rounded-none"
            form="service-form"
            type="submit"
          >
            {service ? "Save service" : "Add service"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function ProjectServices({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [services, setServices] = useState<ProjectService[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectService | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("project_services")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active && data) {
          setServices(data as ProjectService[]);
        }
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [supabase, projectId]);

  async function save(name: string, price: number) {
    if (editing) {
      setServices((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, name, price } : s))
      );
      await supabase
        .from("project_services")
        .update({ name, price })
        .eq("id", editing.id);
      return;
    }
    const { data } = await supabase
      .from("project_services")
      .insert({ project_id: projectId, name, price, position: services.length })
      .select()
      .single();
    if (data) {
      setServices((prev) => [...prev, data as ProjectService]);
    }
  }

  async function remove(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("project_services").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col">
      <Button
        className="w-full rounded-none"
        onClick={() => {
          setEditing(null);
          setDrawerOpen(true);
        }}
        type="button"
      >
        <PlusIcon />
        New service
      </Button>

      <div className="mt-4 flex flex-col divide-y divide-border/60 border border-border">
        {loading ? (
          <p className="shimmer py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {services.map((service) => (
          <div className="flex items-center gap-3 px-3 py-3" key={service.id}>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-[15px] leading-tight">
                {service.name}
              </span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {money(service.price)}
              </span>
            </div>
            <button
              aria-label={`Edit ${service.name}`}
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                setEditing(service);
                setDrawerOpen(true);
              }}
              type="button"
            >
              <PencilIcon className="size-4" />
            </button>
            <ConfirmDelete
              description={<>This removes the “{service.name}” service.</>}
              onConfirm={() => remove(service.id)}
              title="Delete service?"
              triggerClassName="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
              triggerLabel={`Delete ${service.name}`}
            >
              <Trash2Icon className="size-4" />
            </ConfirmDelete>
          </div>
        ))}
        {loading || services.length > 0 ? null : (
          <EmptyState
            description="Add the services you offer so you can drop them into receipts."
            icon={TagIcon}
            title="No services yet"
          />
        )}
      </div>

      <ServiceDrawer
        onOpenChange={setDrawerOpen}
        onSave={save}
        open={drawerOpen}
        service={editing}
      />
    </div>
  );
}
