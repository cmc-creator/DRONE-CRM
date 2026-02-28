"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, FileText, Info } from "lucide-react";

const TAX_CLASSIFICATIONS = [
  { value: "INDIVIDUAL",  label: "Individual / Sole Proprietor / Single-member LLC" },
  { value: "C_CORP",      label: "C Corporation" },
  { value: "S_CORP",      label: "S Corporation" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "LLC_C",       label: "LLC — C corp election" },
  { value: "LLC_S",       label: "LLC — S corp election" },
  { value: "LLC_P",       label: "LLC — Partnership election" },
  { value: "TRUST",       label: "Trust / Estate" },
];

interface W9FormData {
  id: string;
  legalName: string;
  businessName: string | null;
  taxClassification: string;
  tinType: string;
  tinLast4: string;
  reviewStatus: string;
  certifiedAt: string;
}

interface Props {
  pilotId: string;
  existing: W9FormData | null;
}

export default function W9SubmitForm({ pilotId, existing }: Props) {
  const router = useRouter();

  const [legalName,          setLegalName]          = useState(existing?.legalName          ?? "");
  const [businessName,       setBusinessName]       = useState(existing?.businessName       ?? "");
  const [taxClassification,  setTaxClassification]  = useState(existing?.taxClassification  ?? "INDIVIDUAL");
  const [tinType,            setTinType]            = useState(existing?.tinType            ?? "SSN");
  const [tinLast4,           setTinLast4]           = useState(existing?.tinLast4           ?? "");
  const [address,            setAddress]            = useState("");
  const [city,               setCity]               = useState("");
  const [state,              setState]              = useState("");
  const [zip,                setZip]                = useState("");
  const [docUrl,             setDocUrl]             = useState("");
  const [certified,          setCertified]          = useState(false);
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState("");
  const [success,            setSuccess]            = useState(false);

  if (existing?.reviewStatus === "APPROVED") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-green-800 text-sm">W-9 on file and approved</p>
          <p className="text-green-700 text-xs mt-0.5">
            Legal name: <strong>{existing.legalName}</strong> · TIN type: {existing.tinType} ···{existing.tinLast4}
          </p>
          <p className="text-green-700 text-xs mt-1">
            Need to update your information? Contact <a href="mailto:ops@nyxaerial.com" className="underline">ops@nyxaerial.com</a>.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4">
        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-blue-800 text-sm">W-9 submitted — pending admin review</p>
          <p className="text-blue-700 text-xs mt-0.5">
            You'll receive a confirmation once your W-9 is approved. This is required for payment processing and 1099 issuance.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tinLast4.length !== 4 || !/^\d{4}$/.test(tinLast4)) {
      setError("Enter exactly 4 digits for your TIN.");
      return;
    }
    if (!certified) {
      setError("You must certify the information is correct before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pilots/${pilotId}/w9`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName, businessName, taxClassification,
          tinType, tinLast4,
          address, city, state, zip,
          docUrl: docUrl || undefined,
          certified,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-base">Submit W-9 Information</CardTitle>
          {existing?.reviewStatus === "PENDING" && (
            <Badge variant="warning" className="ml-auto">Under Review</Badge>
          )}
          {existing?.reviewStatus === "REJECTED" && (
            <Badge variant="destructive" className="ml-auto">Rejected — Resubmit</Badge>
          )}
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Required for payment processing and annual 1099-NEC tax form issuance. We store only the
          last 4 digits of your TIN — upload a signed W-9 PDF if you prefer to provide your full TIN securely.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Box 1 — Legal Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="legalName">
              Legal name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legalName"
              placeholder="Name as shown on your income tax return"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              required
            />
          </div>

          {/* Box 2 — Business / DBA */}
          <div className="grid gap-1.5">
            <Label htmlFor="businessName">
              Business name / DBA <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="businessName"
              placeholder="Leave blank if same as above"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {/* Box 3 — Tax Classification */}
          <div className="grid gap-1.5">
            <Label>
              Tax classification <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {TAX_CLASSIFICATIONS.map((tc) => (
                <label key={tc.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="taxClassification"
                    value={tc.value}
                    checked={taxClassification === tc.value}
                    onChange={() => setTaxClassification(tc.value)}
                    className="accent-primary"
                  />
                  {tc.label}
                </label>
              ))}
            </div>
          </div>

          {/* Box 5/6 — TIN */}
          <div className="grid gap-1.5">
            <Label>
              Taxpayer Identification Number (TIN) <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-4 mb-2">
              {(["SSN", "EIN"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="tinType"
                    value={t}
                    checked={tinType === t}
                    onChange={() => setTinType(t)}
                    className="accent-primary"
                  />
                  {t === "SSN" ? "Social Security Number" : "Employer Identification Number"}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground text-sm font-mono">
                {tinType === "SSN" ? "***-**-" : "**-***"}
              </div>
              <Input
                placeholder="Last 4 digits"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                value={tinLast4}
                onChange={(e) => setTinLast4(e.target.value.replace(/\D/g, ""))}
                className="w-28 font-mono"
                required
              />
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              We store only the last 4 digits. Upload a signed W-9 PDF below to provide your full TIN securely.
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <Label>
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="State"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional PDF upload URL */}
          <div className="grid gap-1.5">
            <Label htmlFor="docUrl">
              Signed W-9 PDF URL <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="docUrl"
              type="url"
              placeholder="https://drive.google.com/... or OneDrive link"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Upload your signed IRS W-9 form to Google Drive, OneDrive, or Dropbox and paste the share link here.
            </p>
          </div>

          {/* Certification */}
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
            <input
              type="checkbox"
              id="certified"
              checked={certified}
              onChange={(e) => setCertified(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <label htmlFor="certified" className="text-xs leading-relaxed cursor-pointer text-slate-700">
              Under penalties of perjury, I certify that: (1) the number shown on this form is my correct
              taxpayer identification number, (2) I am not subject to backup withholding, and (3) I am a
              U.S. person (including a U.S. resident alien).{" "}
              <span className="text-destructive">*</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting…" : "Submit W-9 Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
