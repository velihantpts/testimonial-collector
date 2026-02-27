"use client";

import { useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onApproveAll: () => Promise<void>;
  onRejectAll: () => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
}

export function BulkActions({
  selectedCount,
  totalCount,
  onApproveAll,
  onRejectAll,
  onDeleteAll,
  onSelectAll,
  onDeselectAll,
  allSelected,
}: BulkActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  async function handleApprove() {
    setLoading(true);
    try {
      await onApproveAll();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      await onRejectAll();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await onDeleteAll();
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="xs"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? "Deselect All" : `Select All (${totalCount})`}
        </Button>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="xs"
          className="text-[#22c55e] hover:bg-[#22c55e]/10 hover:text-[#22c55e]"
          onClick={handleApprove}
          disabled={loading}
        >
          <Check className="h-3.5 w-3.5" />
          Approve All
        </Button>

        <Button
          variant="ghost"
          size="xs"
          className="text-[#f59e0b] hover:bg-[#f59e0b]/10 hover:text-[#f59e0b]"
          onClick={handleReject}
          disabled={loading}
        >
          <X className="h-3.5 w-3.5" />
          Reject All
        </Button>

        <Button
          variant="ghost"
          size="xs"
          className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={loading}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete All
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} testimonials?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              selected testimonials from your project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
