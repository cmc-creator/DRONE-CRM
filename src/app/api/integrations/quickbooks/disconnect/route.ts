import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/integrations/quickbooks/disconnect
 * Removes the QBO OAuth tokens from the Account table.
 * Does NOT clear qboId / qboCustomerId fields (useful for reconnecting).
 */
export async function DELETE() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.account.findFirst({ where: { provider: "quickbooks" } });
  if (!account) return NextResponse.json({ message: "Not connected" });

  await prisma.account.delete({
    where: {
      provider_providerAccountId: {
        provider:          "quickbooks",
        providerAccountId: account.providerAccountId,
      },
    },
  });

  return NextResponse.json({ message: "Disconnected" });
}
