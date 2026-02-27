import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  MapPin,
  Plane,
  FileCheck,
  DollarSign,
  Briefcase,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PilotDetailPage({ params }: Props) {
  const { id } = await params;

  const pilot = await prisma.pilot.findUnique({
    where: { id },
    include: {
      user: true,
      markets: true,
      equipment: true,
      complianceDocs: { orderBy: { expiresAt: "asc" } },
      jobAssignments: {
        orderBy: { assignedAt: "desc" },
        take: 10,
        include: {
          job: {
            include: { client: true },
          },
          payment: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { job: { select: { title: true, id: true } } },
      },
    },
  });

  if (!pilot) notFound();

  const totalEarned = pilot.jobAssignments.reduce(
    (sum: number, a) => sum + (a.payment?.amount.toNumber() ?? 0),
    0
  );

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-600",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };

  const jobStatusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING_ASSIGNMENT: "bg-orange-100 text-orange-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    CAPTURE_COMPLETE: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/pilots"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pilots
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{pilot.user.name ?? "Unnamed Pilot"}</h1>
            <p className="text-muted-foreground">{pilot.user.email}</p>
            {pilot.businessName && (
              <p className="text-sm text-muted-foreground">{pilot.businessName}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[pilot.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {pilot.status}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/pilots/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-xl font-bold">{formatCurrency(totalEarned)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
                <p className="text-xl font-bold">
                  {pilot.jobAssignments.filter(
                    (a) => a.job.status === "COMPLETED" || a.job.status === "DELIVERED"
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Plane className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipment</p>
                <p className="text-xl font-bold">{pilot.equipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {pilot.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{pilot.phone}</span>
              </div>
            )}
            {pilot.phone && <Separator />}
            <div className="flex justify-between">
              <span className="text-muted-foreground">FAA Part 107</span>
              <span>{pilot.faaPartNumber ? `#${pilot.faaPartNumber}` : "Not on file"}</span>
            </div>
            {pilot.faaExpiry && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FAA Expiry</span>
                  <span className={new Date(pilot.faaExpiry) < new Date() ? "text-red-600 font-medium" : ""}>
                    {formatDate(pilot.faaExpiry)}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">W-9 on File</span>
              <span>{pilot.w9OnFile ? "Yes ✓" : "No"}</span>
            </div>
            {pilot.bio && (
              <>
                <Separator />
                <p className="text-muted-foreground italic">{pilot.bio}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Markets & Equipment */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pilot.markets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No markets listed</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pilot.markets.map((m) => (
                    <Badge key={m.id} variant="secondary">
                      {m.city ? `${m.city}, ` : ""}{m.state}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plane className="h-4 w-4" /> Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pilot.equipment.length === 0 ? (
                <p className="text-sm text-muted-foreground">No equipment listed</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {pilot.equipment.map((eq) => (
                    <li key={eq.id} className="flex justify-between">
                      <span>{eq.make} {eq.model}</span>
                      {eq.serialNumber && (
                        <span className="text-muted-foreground font-mono text-xs">
                          SN: {eq.serialNumber}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compliance Docs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-4 w-4" /> Compliance Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilot.complianceDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No compliance documents uploaded.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Expiry</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pilot.complianceDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2">{doc.type.replace(/_/g, " ")}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "EXPIRED"
                            ? "bg-red-100 text-red-800"
                            : doc.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-2">{doc.expiresAt ? formatDate(doc.expiresAt) : "—"}</td>
                    <td className="py-2">{formatDate(doc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Job History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" /> Recent Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilot.jobAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No job assignments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Job</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Client</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Pay</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pilot.jobAssignments.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2">
                      <Link
                        href={`/admin/jobs/${a.job.id}`}
                        className="hover:underline text-blue-600"
                      >
                        {a.job.title}
                      </Link>
                    </td>
                    <td className="py-2">{a.job.client.companyName}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${jobStatusColor[a.job.status] ?? ""}`}
                      >
                        {a.job.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2">
                      {a.payment ? formatCurrency(a.payment.amount) : "—"}
                    </td>
                    <td className="py-2">{formatDate(a.job.scheduledDate ?? a.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-yellow-500" /> Pilot Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilot.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Aggregate */}
              <div className="flex items-center gap-3 pb-3 border-b">
                <span className="text-3xl font-bold">
                  {(pilot.reviews.reduce((s, r) => s + r.rating, 0) / pilot.reviews.length).toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <=
                          Math.round(
                            pilot.reviews.reduce((s, r) => s + r.rating, 0) /
                              pilot.reviews.length
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pilot.reviews.length} review{pilot.reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Individual reviews */}
              {pilot.reviews.map((review) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.job && (
                    <p className="text-xs text-muted-foreground">
                      Job:{" "}
                      <Link
                        href={`/admin/jobs/${review.job.id}`}
                        className="hover:underline text-primary"
                      >
                        {review.job.title}
                      </Link>
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
