"use client";

import Link from "next/link";
import { EllipsisVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MobileAction = {
  label: string;
  href: string;
};

type MobileRowActionsProps = {
  title: string;
  subtitle?: string;
  actions: MobileAction[];
};

export function MobileRowActions({ title, subtitle, actions }: MobileRowActionsProps) {
  if (actions.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-7 w-7 md:hidden"
          aria-label={`Open actions for ${title}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
        </DialogHeader>

        <div className="space-y-2">
          {actions.map((action) => (
            <Link key={`${action.label}-${action.href}`} href={action.href}>
              <Button variant="outline" className="w-full justify-between">
                {action.label}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
