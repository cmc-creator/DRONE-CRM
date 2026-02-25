"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ImportResult {
  created: number;
  skipped: number;
  results?: Array<{ row: number; email?: string; status: string; reason?: string }>;
}

interface CsvImportButtonProps {
  /** POST endpoint, e.g. "/api/import/pilots" */
  endpoint: string;
  /** GET endpoint to download a blank template CSV */
  templateEndpoint?: string;
  label?: string;
  onSuccess?: (result: ImportResult) => void;
}

export function CsvImportButton({
  endpoint,
  templateEndpoint,
  label = "Import CSV",
  onSuccess,
}: CsvImportButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-uploaded after fixing errors
    e.target.value = "";

    setState("uploading");
    setMsg(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(endpoint, { method: "POST", body: form });
      const data: ImportResult & { error?: string } = await res.json();

      if (!res.ok) {
        setState("error");
        setMsg(data.error ?? "Import failed");
        return;
      }

      const skippedMsg = data.skipped > 0 ? `, ${data.skipped} skipped` : "";
      setState("done");
      setMsg(`${data.created} imported${skippedMsg}`);
      onSuccess?.(data);

      // Auto-reset after 5 s
      setTimeout(() => { setState("idle"); setMsg(null); }, 5000);
    } catch {
      setState("error");
      setMsg("Network error — try again");
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />

      <Button
        variant="outline"
        size="sm"
        disabled={state === "uploading"}
        onClick={() => fileRef.current?.click()}
        className={
          state === "done"
            ? "border-emerald-500 text-emerald-400"
            : state === "error"
            ? "border-red-500 text-red-400"
            : ""
        }
      >
        {state === "uploading" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : state === "done" ? (
          <CheckCircle className="w-4 h-4 mr-2" />
        ) : state === "error" ? (
          <XCircle className="w-4 h-4 mr-2" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {state === "uploading"
          ? "Importing…"
          : state === "done"
          ? msg ?? "Done"
          : state === "error"
          ? msg ?? "Error"
          : label}
      </Button>

      {templateEndpoint && state === "idle" && (
        <a href={templateEndpoint} download title="Download blank template CSV">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground px-2">
            Template
          </Button>
        </a>
      )}
    </div>
  );
}
