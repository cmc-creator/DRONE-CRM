import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#475569",
  PENDING_ASSIGNMENT: "#94a3b8",
  ASSIGNED: "#60a5fa",
  IN_PROGRESS: "#fbbf24",
  CAPTURE_COMPLETE: "#a78bfa",
  DELIVERED: "#34d399",
  COMPLETED: "#34d399",
  CANCELLED: "#f87171",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()));
  const month = parseInt(params.month ?? String(now.getMonth()));

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const jobs = await prisma.job.findMany({
    where: { scheduledDate: { gte: startOfMonth, lte: endOfMonth } },
    include: {
      client: { select: { companyName: true } },
      assignments: {
        include: { pilot: { include: { user: { select: { name: true } } } } },
        take: 1,
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  const jobsByDay: Record<number, typeof jobs> = {};
  for (const job of jobs) {
    const day = new Date(job.scheduledDate!).getDate();
    if (!jobsByDay[day]) jobsByDay[day] = [];
    jobsByDay[day].push(job);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekDay = getFirstDayOfMonth(year, month);

  const prevMonth = month === 0 ? { m: 11, y: year - 1 } : { m: month - 1, y: year };
  const nextMonth = month === 11 ? { m: 0, y: year + 1 } : { m: month + 1, y: year };

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg,#fff 0%,#00d4ff 60%,#7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Mission Calendar
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
            Scheduled flights and operations
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.25)",
              color: "#00d4ff",
            }}
          >
            <CalendarDays className="w-4 h-4" />
            Schedule Mission
          </button>
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.07)" }}
        >
          <Link href={`/admin/calendar?month=${prevMonth.m}&year=${prevMonth.y}`}>
            <button
              className="p-2 rounded-lg transition-all hover:bg-cyan-900/30"
              style={{ color: "rgba(0,212,255,0.6)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <h2 className="text-base font-bold" style={{ color: "#d8e8f4" }}>
            {MONTH_NAMES[month]} {year}
          </h2>
          <Link href={`/admin/calendar?month=${nextMonth.m}&year=${nextMonth.y}`}>
            <button
              className="p-2 rounded-lg transition-all hover:bg-cyan-900/30"
              style={{ color: "rgba(0,212,255,0.6)" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="py-3 text-xs font-bold uppercase tracking-wider"
              style={{ color: "rgba(0,212,255,0.35)" }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstWeekDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-24 p-2"
              style={{
                borderTop: "1px solid rgba(0,212,255,0.05)",
                borderRight: "1px solid rgba(0,212,255,0.05)",
              }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayJobs = jobsByDay[day] ?? [];
            const today = isToday(day);
            return (
              <div
                key={day}
                className="min-h-24 p-2"
                style={{
                  borderTop: "1px solid rgba(0,212,255,0.05)",
                  borderRight: "1px solid rgba(0,212,255,0.05)",
                  background: today ? "rgba(0,212,255,0.04)" : undefined,
                }}
              >
                <span
                  className="text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1"
                  style={{
                    background: today ? "#00d4ff" : "transparent",
                    color: today ? "#04080f" : "rgba(0,212,255,0.5)",
                  }}
                >
                  {day}
                </span>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => (
                    <Link key={job.id} href={`/admin/jobs/${job.id}`}>
                      <div
                        className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium leading-tight cursor-pointer"
                        style={{
                          background: `${STATUS_COLORS[job.status] ?? "#94a3b8"}18`,
                          color: STATUS_COLORS[job.status] ?? "#94a3b8",
                          border: `1px solid ${STATUS_COLORS[job.status] ?? "#94a3b8"}30`,
                        }}
                      >
                        {job.title}
                      </div>
                    </Link>
                  ))}
                  {dayJobs.length > 3 && (
                    <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.3)" }}>
                      +{dayJobs.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({ length: (7 - ((firstWeekDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div
              key={`trail-${i}`}
              className="min-h-24 p-2"
              style={{
                borderTop: "1px solid rgba(0,212,255,0.05)",
                borderRight: "1px solid rgba(0,212,255,0.05)",
              }}
            />
          ))}
        </div>
      </div>

      {jobs.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}
        >
          <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,212,255,0.07)" }}>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "rgba(0,212,255,0.5)" }}
            >
              {jobs.length} missions this month
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(0,212,255,0.05)" }}>
            {jobs.map((job) => {
              const pilotName = job.assignments[0]?.pilot?.user?.name ?? null;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`}>
                  <div className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-cyan-900/10 cursor-pointer">
                    <div className="w-10 text-center">
                      <p
                        className="text-xl font-black leading-none"
                        style={{ color: "#00d4ff" }}
                      >
                        {new Date(job.scheduledDate!).getDate()}
                      </p>
                      <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.3)" }}>
                        {DAY_LABELS[new Date(job.scheduledDate!).getDay()]}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#d8e8f4" }}
                      >
                        {job.title}
                      </p>
                      <p className="text-xs truncate" style={{ color: "rgba(0,212,255,0.4)" }}>
                        {job.client?.companyName ?? "No client"}
                        {pilotName ? ` - ${pilotName}` : " - Unassigned"}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `${STATUS_COLORS[job.status] ?? "#94a3b8"}15`,
                        color: STATUS_COLORS[job.status] ?? "#94a3b8",
                      }}
                    >
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}