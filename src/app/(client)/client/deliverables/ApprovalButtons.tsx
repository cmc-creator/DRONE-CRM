"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, RefreshCw } from "lucide-react";

interface ApprovalButtonsProps {
  jobId: string;
  fileId: string;
  currentStatus: string;
  onUpdate?: (fileId: string, newStatus: string) => void;
}

export function ApprovalButtons({ jobId, fileId, currentStatus, onUpdate }: ApprovalButtonsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  async function sendApproval(approvalStatus: string, approvalNote?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus, approvalNote }),
      });
      if (res.ok) {
        setStatus(approvalStatus);
        onUpdate?.(fileId, approvalStatus);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
        <CheckCircle className="h-3 w-3" /> Approved
      </span>
    );
  }

  if (status === "REVISION_REQUESTED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
        <RefreshCw className="h-3 w-3" /> Revision Requested
      </span>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          disabled={loading}
          onClick={() => sendApproval("APPROVED")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          disabled={loading}
          onClick={() => setShowRevisionDialog(true)}
        >
          Revision
        </Button>
      </div>

      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Describe what changes are needed..."
            value={revisionNote}
            onChange={(e) => setRevisionNote(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={loading || !revisionNote.trim()}
              onClick={async () => {
                await sendApproval("REVISION_REQUESTED", revisionNote);
                setShowRevisionDialog(false);
                setRevisionNote("");
              }}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
