import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AvailabilityCalendar from "@/components/pilot/AvailabilityCalendar";

export const dynamic = "force-dynamic";

export default async function PilotAvailabilityPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    select: { id: true, user: { select: { name: true } } },
  });

  if (!pilot) {
    return (
      <div className="rounded-xl p-8 text-center"
        style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}>
        <p className="text-sm" style={{ color: "rgba(0,212,255,0.5)" }}>Pilot profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>My Availability</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(0,212,255,0.4)" }}>
          Mark days you&apos;re unavailable. Green = available by default. Red = blocked.
        </p>
      </div>

      <AvailabilityCalendar pilotId={pilot.id} />

      <div className="rounded-xl p-4" style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}>
        <p className="text-xs" style={{ color: "rgba(0,212,255,0.4)" }}>
          <span className="font-semibold" style={{ color: "rgba(0,212,255,0.6)" }}>Tip:</span>{" "}
          Click any future date to toggle it as unavailable. Click again to clear. Your availability is visible to dispatchers when assigning jobs.
        </p>
      </div>
    </div>
  );
}
