import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Download, Receipt, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const TAX_CLASSIFICATION_LABELS: Record<string, string> = {
  INDIVIDUAL:   "Individual / SP",
  C_CORP:       "C Corp",
  S_CORP:       "S Corp",
  PARTNERSHIP:  "Partnership",
  LLC_C:        "LLC (C)",
  LLC_S:        "LLC (S)",
  LLC_P:        "LLC (P)",
  TRUST:        "Trust",
  OTHER:        "Other",
};

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function TaxPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const year = parseInt(sp.year ?? String(CURRENT_YEAR), 10);

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate   = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const payments = await prisma.pilotPayment.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: startDate, lt: endDate },
    },
    include: {
      pilot: {
        include: {
          user:   { select: { name: true, email: true } },
          w9Form: true,
        },
      },
    },
  });

  // Group by pilot
  const map = new Map<string, {
    pilotId: string;
    name: string;
    email: string;
    businessName: string | null;
    taxClassification: string | null;
    tinType: string | null;
    tinDisplay: string | null;
    address: string | null;
    w9Status: string;
    w9Id: string | null;
    totalPaid: number;
    paymentCount: number;
  }>();

  for (const p of payments) {
    const w9 = p.pilot.w9Form;
    const amount = Number(p.amount);

    const tinDisplay = w9
      ? w9.tinType === "SSN"
        ? `***-**-${w9.tinLast4}`
        : `**-***${w9.tinLast4}`
      : null;

    const entry = map.get(p.pilotId);
    if (!entry) {
      map.set(p.pilotId, {
        pilotId:         p.pilotId,
        name:            w9?.legalName ?? p.pilot.user.name ?? "Unknown",
        email:           p.pilot.user.email,
        businessName:    w9?.businessName ?? p.pilot.businessName ?? null,
        taxClassification: w9 ? (TAX_CLASSIFICATION_LABELS[w9.taxClassification] ?? w9.taxClassification) : null,
        tinType:         w9?.tinType ?? null,
        tinDisplay,
        address:         w9 ? `${w9.address}, ${w9.city}, ${w9.state} ${w9.zip}` : null,
        w9Status:        w9 ? w9.reviewStatus : "NONE",
        w9Id:            w9?.id ?? null,
        totalPaid:       amount,
        paymentCount:    1,
      });
    } else {
      entry.totalPaid    += amount;
      entry.paymentCount += 1;
    }
  }

  const pilots = Array.from(map.values())
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const requires1099 = pilots.filter((p) => p.totalPaid >= 600);
  const missingW9    = requires1099.filter((p) => p.w9Status !== "APPROVED");
  const totalPayouts = pilots.reduce((s, p) => s + p.totalPaid, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-7 h-7" /> Tax / 1099-NEC
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pilot payout totals for tax year <strong>{year}</strong>. Pilots paid $600+ require a 1099-NEC.
          </p>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-3">
          <form method="GET">
            <select
              name="year"
              defaultValue={year}
              onChange={(e) => {
                (e.target.closest("form") as HTMLFormElement).submit();
              }}
              className="border rounded-md px-3 py-1.5 text-sm bg-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </form>

          {requires1099.length > 0 && (
            <Link
              href={`/api/admin/tax/1099/export?year=${year}`}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Link>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Payouts",     value: formatCurrency(totalPayouts),    color: "text-slate-900" },
          { label: "Pilots Paid",       value: String(pilots.length),           color: "text-slate-900" },
          { label: "1099 Required",     value: String(requires1099.length),     color: requires1099.length > 0 ? "text-amber-600" : "text-slate-900" },
          { label: "Missing W-9",       value: String(missingW9.length),        color: missingW9.length > 0 ? "text-destructive" : "text-green-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Missing W-9 alert */}
      {missingW9.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-destructive">
              {missingW9.length} pilot{missingW9.length > 1 ? "s" : ""} require a 1099 but have no approved W-9
            </p>
            <p className="text-red-700 mt-1 text-xs">
              Reach out to collect W-9s before filing. Pilots can submit via their Documents page.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {missingW9.map((p) => (
                <Link
                  key={p.pilotId}
                  href={`/admin/pilots/${p.pilotId}`}
                  className="text-xs bg-red-100 hover:bg-red-200 text-destructive px-2 py-0.5 rounded-full transition-colors"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All pilots with payments table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pilot Payout Summary — {year}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pilots.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No paid pilot payments found for {year}.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Business / DBA</TableHead>
                  <TableHead>Tax Class.</TableHead>
                  <TableHead>TIN</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead>W-9</TableHead>
                  <TableHead>1099</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilots.map((p) => {
                  const needs1099 = p.totalPaid >= 600;
                  return (
                    <TableRow key={p.pilotId} className={needs1099 && p.w9Status !== "APPROVED" ? "bg-red-50/40" : undefined}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/pilots/${p.pilotId}`}
                            className="font-medium hover:underline text-primary text-sm"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.businessName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.taxClassification ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {p.tinDisplay ?? <span className="text-muted-foreground text-xs">No W-9</span>}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(p.totalPaid)}
                      </TableCell>
                      <TableCell>
                        {p.w9Status === "APPROVED" ? (
                          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </div>
                        ) : p.w9Status === "PENDING" ? (
                          <Badge variant="warning" className="text-xs">Pending</Badge>
                        ) : p.w9Status === "REJECTED" ? (
                          <div className="flex items-center gap-1 text-destructive text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {needs1099 ? (
                          <Badge variant={p.w9Status === "APPROVED" ? "success" : "destructive"} className="text-xs">
                            Required
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Under $600</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        1099-NEC required for any contractor paid $600 or more in a calendar year. Export CSV and
        provide to your accountant or upload directly to the IRS FIRE system. TINs shown are masked;
        full TINs are on the pilot&apos;s uploaded W-9 PDF.
      </p>
    </div>
  );
}
