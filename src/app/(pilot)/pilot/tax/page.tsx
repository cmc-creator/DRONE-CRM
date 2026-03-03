import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { FileText, AlertCircle, CheckCircle2, Receipt } from "lucide-react";

export default async function PilotTaxPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      user: { select: { name: true, email: true } },
      payments: {
        where: { status: "PAID" },
        include: {
          assignment: {
            include: { job: { select: { title: true, city: true, state: true } } },
          },
        },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!pilot) return <p className="text-muted-foreground">Profile not found.</p>;

  // Group PAID payments by calendar year
  type YearBucket = { total: number; count: number };
  const byYear: Record<number, YearBucket> = {};

  for (const p of pilot.payments) {
    const year = p.paidAt
      ? new Date(p.paidAt).getFullYear()
      : new Date(p.createdAt).getFullYear();
    if (!byYear[year]) byYear[year] = { total: 0, count: 0 };
    byYear[year].total += Number(p.amount);
    byYear[year].count += 1;
  }

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const THRESHOLD = 600;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Receipt className="w-8 h-8" />
          Tax / 1099
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your annual earnings summary for tax reporting purposes.
        </p>
      </div>

      {/* W-9 Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5" />
            W-9 Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilot.w9OnFile ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  W-9 on file
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your earnings will be reported on a 1099-NEC for any calendar
                  year in which you earn $600 or more.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  W-9 not on file
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Please upload your W-9 in the{" "}
                  <a
                    href="/pilot/documents"
                    className="underline hover:text-foreground transition-colors"
                  >
                    My Documents
                  </a>{" "}
                  section so we can issue your 1099-NEC.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Annual Earnings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Annual Earnings Summary</h2>

        {years.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No paid earnings found yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {years.map((year) => {
              const data = byYear[year];
              const isReportable = data.total >= THRESHOLD;

              return (
                <Card key={year}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">{year} Tax Year</CardTitle>
                    <Badge variant={isReportable ? "success" : "secondary"}>
                      {isReportable ? "1099 Reportable" : `Below $${THRESHOLD} threshold`}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        Total Paid
                      </span>
                      <span className="text-xl font-bold">
                        {formatCurrency(data.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">
                        Paid Jobs
                      </span>
                      <span className="text-sm font-medium">{data.count}</span>
                    </div>
                    {isReportable && (
                      <p className="text-xs text-muted-foreground pt-1 border-t">
                        Your {year} total exceeds the $600 IRS reporting
                        threshold. Expect a 1099-NEC for this tax year.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Note:</strong> The IRS requires businesses to issue a
            1099-NEC to independent contractors paid $600 or more in a calendar
            year. If you do not receive a 1099-NEC by January 31st for a
            qualifying year, please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
