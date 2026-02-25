import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSignature, CheckCircle, Clock, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT:  "bg-gray-100 text-gray-700",
    SENT:   "bg-blue-100 text-blue-700",
    SIGNED: "bg-green-100 text-green-700",
    VOID:   "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default async function ClientContractsPage() {
  const session = await auth();
  if (!session) return null;

  // Get the client record linked to this user
  const client = await prisma.client.findFirst({
    where: { user: { id: session.user.id } },
  });

  const contracts = client
    ? await prisma.contract.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const total  = contracts.length;
  const signed = contracts.filter((c) => c.status === "SIGNED").length;
  const awaiting = contracts.filter((c) => c.status === "SENT").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground text-sm mt-1">Your service agreements with Lumin Aerial.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-7 w-7 text-muted-foreground" />
            <div><p className="text-2xl font-bold">{total}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-7 w-7 text-green-500" />
            <div><p className="text-2xl font-bold">{signed}</p><p className="text-xs text-muted-foreground">Signed</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-7 w-7 text-blue-500" />
            <div><p className="text-2xl font-bold">{awaiting}</p><p className="text-xs text-muted-foreground">Awaiting Signature</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Action needed */}
      {awaiting > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-center gap-3">
          <FileSignature className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            You have {awaiting} contract{awaiting > 1 ? "s" : ""} awaiting your signature. Review and sign below.
          </p>
        </div>
      )}

      {/* List */}
      <Card>
        <CardHeader><CardTitle>All Contracts</CardTitle></CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No contracts yet. Lumin Aerial will send agreements here when ready.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-xl border p-4 ${c.status === "SENT" ? "border-blue-200 bg-blue-50/40" : ""}`}
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-muted-foreground">
                        Sent {c.sentAt ? formatDate(c.sentAt.toISOString()) : "—"}
                      </span>
                      {c.signedAt && (
                        <span className="text-xs text-green-600 font-medium">
                          Signed {formatDate(c.signedAt.toISOString())}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {c.status === "SENT" && (
                      <Link href={`/contracts/${c.id}/sign`}>
                        <Button size="sm" className="gap-1">
                          <FileSignature className="h-3.5 w-3.5" />
                          Sign Now
                        </Button>
                      </Link>
                    )}
                    {c.status === "SIGNED" && (
                      <Link href={`/contracts/${c.id}/sign`}>
                        <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-200 hover:bg-green-50">
                          <CheckCircle className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
