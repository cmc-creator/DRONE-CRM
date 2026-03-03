import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";
import { ClientMapView } from "./ClientMapView";

export default async function ClientMapPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  });

  const data = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName,
    email: c.email,
    phone: c.phone,
    city: c.city,
    state: c.state,
    address: c.address,
    status: c.status as string,
    type: c.type as string,
    jobCount: c._count.jobs,
    invoiceCount: c._count.invoices,
  }));

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-4rem)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Client Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} clients · RouteIQ route planning · Territory analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/clients">
            <Button variant="outline" size="sm">
              <List className="w-4 h-4 mr-1.5" />
              List View
            </Button>
          </Link>
          <Link href="/admin/clients/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <ClientMapView clients={data} />
      </div>
    </div>
  );
}
