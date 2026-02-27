import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, User, MapPin, Building2, DollarSign } from "lucide-react";
import QuoteActions from "./QuoteActions";

const statusColor: Record<string, string> = {
  NEW: "bg-cyan-100 text-cyan-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  CONVERTED: "bg-green-100 text-green-800",
  DISMISSED: "bg-gray-100 text-gray-600",
};

export default async function AdminQuotesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, companyName: true } } },
  });

  const counts = {
    NEW: quotes.filter((q) => q.status === "NEW").length,
    REVIEWED: quotes.filter((q) => q.status === "REVIEWED").length,
    CONVERTED: quotes.filter((q) => q.status === "CONVERTED").length,
    DISMISSED: quotes.filter((q) => q.status === "DISMISSED").length,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Inbound requests from{" "}
            <a
              href="/quote"
              target="_blank"
              className="text-primary hover:underline"
            >
              luminaerial.com/quote
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          {Object.entries(counts).map(([status, count]) => (
            <div
              key={status}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColor[status]}`}
            >
              {count} {status}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No quote requests yet.</p>
            <p className="text-sm mt-1">
              Share{" "}
              <span className="font-mono text-xs bg-muted px-1 rounded">
                /quote
              </span>{" "}
              with prospective clients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-0">
                  {/* Status stripe */}
                  <div
                    className={`w-1 self-stretch flex-shrink-0 ${
                      q.status === "NEW"
                        ? "bg-cyan-400"
                        : q.status === "REVIEWED"
                        ? "bg-blue-400"
                        : q.status === "CONVERTED"
                        ? "bg-green-400"
                        : "bg-gray-300"
                    }`}
                  />

                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left: person info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{q.name}</span>
                          <Badge
                            className={`text-xs ${statusColor[q.status]}`}
                          >
                            {q.status}
                          </Badge>
                          {q.client && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              Converted → {q.client.companyName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <a
                              href={`mailto:${q.email}`}
                              className="hover:underline text-primary"
                            >
                              {q.email}
                            </a>
                          </span>
                          {q.phone && (
                            <span className="flex items-center gap-1">
                              <span className="text-xs">📞</span> {q.phone}
                            </span>
                          )}
                          {q.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {q.company}
                            </span>
                          )}
                          {(q.city || q.state) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[q.city, q.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: date + actions */}
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(q.createdAt)}</span>
                        <QuoteActions quoteId={q.id} currentStatus={q.status} />
                      </div>
                    </div>

                    {/* Service / budget row */}
                    {(q.serviceType || q.budget) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.serviceType && (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            ✈️ {q.serviceType}
                          </span>
                        )}
                        {q.budget && (
                          <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                            <DollarSign className="h-3 w-3" /> {q.budget}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {q.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {q.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
