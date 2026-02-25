import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin/dashboard");
    case "PILOT":
      redirect("/pilot/dashboard");
    case "CLIENT":
      redirect("/client/dashboard");
    default:
      redirect("/login");
  }
}
