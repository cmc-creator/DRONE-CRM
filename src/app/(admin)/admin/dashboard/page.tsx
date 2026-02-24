import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RecentJobsTable } from "@/components/admin/recent-jobs-table";

async function getDashboardStats() {
  const [
    totalPilots,
    activePilots,
    totalClients,
    activeClients,
    totalJobs,
    jobsInProgress,
    completedJobs,
    pendingJobs,
    totalRevenue,
    pendingInvoices,
  ] = await Promise.all([
    prisma.pilot.count(),
    prisma.pilot.count({ where: { status: "ACTIVE" } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "IN_PROGRESS" } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.job.count({ where: { status: "PENDING_ASSIGNMENT" } }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["SENT", "OVERDUE"] } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalPilots,
    activePilots,
    totalClients,
    activeClients,
    totalJobs,
    jobsInProgress,
    completedJobs,
    pendingJobs,
    totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
    pendingInvoices: Number(pendingInvoices._sum.totalAmount ?? 0),
  };
}

async function getRecentJobs() {
  return prisma.job.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      assignments: {
        include: { pilot: { include: { user: { select: { name: true } } } } },
      },
    },
  });
}

export default async function AdminDashboard() {
  const [stats, recentJobs] = await Promise.all([
    getDashboardStats(),
    getRecentJobs(),
  ]);

  const statCards = [
    {
      title: "Active Pilots",
      value: stats.activePilots,
      sub: `${stats.totalPilots} total`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Clients",
      value: stats.activeClients,
      sub: `${stats.totalClients} total`,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Jobs In Progress",
      value: stats.jobsInProgress,
      sub: `${stats.pendingJobs} pending assignment`,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs,
      sub: `${stats.totalJobs} total`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      sub: "All paid invoices",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      isString: true,
    },
    {
      title: "Pending Invoices",
      value: formatCurrency(stats.pendingInvoices),
      sub: "Outstanding balance",
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      isString: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Lumin Aerial operations overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stat.isString ? stat.value : stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RecentJobsTable jobs={recentJobs} />
        </CardContent>
      </Card>
    </div>
  );
}
