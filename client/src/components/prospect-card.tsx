import { useState } from "react";
import type { Prospect } from "@shared/schema";
import { formatPay, STATUSES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Trash2, Pencil, Flame, ThumbsUp, Minus, ArrowLeftRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProspectForm } from "./edit-prospect-form";

function InterestIndicator({ level }: { level: string }) {
  switch (level) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400" data-testid="interest-high">
          <Flame className="w-3 h-3" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400" data-testid="interest-medium">
          <ThumbsUp className="w-3 h-3" />
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground" data-testid="interest-low">
          <Minus className="w-3 h-3" />
          Low
        </span>
      );
    default:
      return null;
  }
}

function InlinePayEditor({ prospect }: { prospect: Prospect }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(prospect.pay != null ? String(prospect.pay) : "");

  const mutation = useMutation({
    mutationFn: async (pay: number | null) => {
      await apiRequest("PATCH", `/api/prospects/${prospect.id}`, { pay });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      setOpen(false);
      toast({ title: "Salary updated" });
    },
    onError: () => {
      toast({ title: "Failed to update salary", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed === "") {
      mutation.mutate(null);
      return;
    }
    const num = parseInt(trimmed, 10);
    if (isNaN(num) || num <= 0) {
      toast({ title: "Please enter a valid positive number", variant: "destructive" });
      return;
    }
    mutation.mutate(num);
  };

  if (prospect.pay != null) {
    return (
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setValue(String(prospect.pay)); }}>
        <PopoverTrigger asChild>
          <button
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer bg-transparent border-0 p-0"
            onClick={(e) => e.stopPropagation()}
            data-testid={`text-pay-${prospect.id}`}
          >
            {formatPay(prospect.pay)}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            <label className="text-xs font-medium">Target Salary</label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 85000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid={`input-inline-pay-${prospect.id}`}
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={handleSave}
                disabled={mutation.isPending}
                data-testid={`button-save-pay-${prospect.id}`}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => { setValue(""); mutation.mutate(null); }}
                disabled={mutation.isPending}
                data-testid={`button-remove-pay-${prospect.id}`}
              >
                Remove
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setValue(""); }}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-0"
          onClick={(e) => e.stopPropagation()}
          data-testid={`button-add-pay-${prospect.id}`}
        >
          Add $
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <label className="text-xs font-medium">Target Salary</label>
          <Input
            type="number"
            min="1"
            placeholder="e.g. 85000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid={`input-inline-pay-${prospect.id}`}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            className="w-full h-7 text-xs"
            onClick={handleSave}
            disabled={mutation.isPending}
            data-testid={`button-save-pay-${prospect.id}`}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getOrderedStatusOptions(currentStatus: string): string[] {
  const index = STATUSES.indexOf(currentStatus as (typeof STATUSES)[number]);
  if (index === -1) return [...STATUSES];
  return [...STATUSES.slice(index + 1), ...STATUSES.slice(0, index)];
}

export function ProspectCard({
  prospect,
  onStatusChange,
}: {
  prospect: Prospect;
  onStatusChange?: (oldStatus: string, newStatus: string) => void;
}) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/prospects/${prospect.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: "Prospect deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete prospect", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/prospects/${prospect.id}`, { status: newStatus });
    },
    onSuccess: (_data, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: `Status updated to ${newStatus}` });
      onStatusChange?.(prospect.status, newStatus);
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const isOffer = prospect.status === "Offer";
  const cardClasses = `group bg-card border border-card-border rounded-md p-3 space-y-2 hover-elevate cursor-pointer transition-all duration-150${isOffer ? " offer-card-glow" : ""}`;

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => setEditOpen(true)}
        data-testid={`card-prospect-${prospect.id}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-tight truncate" data-testid={`text-company-${prospect.id}`}>
              {prospect.companyName}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`text-role-${prospect.id}`}>
              {prospect.roleTitle}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                  disabled={statusMutation.isPending}
                  data-testid={`button-status-${prospect.id}`}
                >
                  <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {getOrderedStatusOptions(prospect.status).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    data-testid={`status-option-${s.replace(/\s+/g, "-").toLowerCase()}-${prospect.id}`}
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              data-testid={`button-edit-${prospect.id}`}
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${prospect.id}`}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <InterestIndicator level={prospect.interestLevel} />
          <InlinePayEditor prospect={prospect} />
        </div>

        {prospect.jobUrl && (
          <a
            href={prospect.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
            data-testid={`link-job-url-${prospect.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            Posting
          </a>
        )}

        {prospect.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-notes-${prospect.id}`}>
            {prospect.notes}
          </p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prospect</DialogTitle>
          </DialogHeader>
          <EditProspectForm prospect={prospect} onSuccess={() => setEditOpen(false)} onStatusChange={onStatusChange} />
        </DialogContent>
      </Dialog>
    </>
  );
}
